//package com.mbstu.diningpass.meal.controller;
//
//import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
//import com.mbstu.diningpass.meal.dto.request.payment.BkashExecuteRequest;
//import com.mbstu.diningpass.meal.dto.request.payment.BkashRefundRequest;
//import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
//import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
//import com.mbstu.diningpass.meal.enums.Role;
//import com.mbstu.diningpass.meal.service.abstraction.BkashPaymentService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.http.ResponseEntity;
//
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/payment/bkash")
//@RequiredArgsConstructor
//public class BkashPaymentController {
//
//    private final BkashPaymentService bkashPaymentService;
//    private final Logger logger= LoggerFactory.getLogger(BkashPaymentController.class);
//
//
//
//
//    @PostMapping("/create")
//    public ResponseEntity<CutTokenResponse> create(
//            @RequestHeader("X-User-Id")   UUID studentId,
//            @RequestHeader("X-User-Role") Role role,
//            @Valid  @RequestBody CutTokenRequest request) {
//
//
//        CutTokenResponse response = bkashPaymentService.createPayment(studentId, role, request);
//        logger.info("[Bkash_CREATE_PAYMENT] studentId={} role={} mealDate={} mealTypes={} paymentMethod{}", studentId, role, request.mealDate(), request.mealTypes(),request.paymentMethod());
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }
//
//
//
//
//
//    // Execute Payment
//    @PostMapping("/execute")
//    public ResponseEntity<BkashExecutePaymentResponse> execute(
//            @Valid @RequestBody BkashExecuteRequest request) {
//
//        BkashExecutePaymentResponse response = bkashPaymentService.executePayment(request.paymentID());
//        logger.info("[Bkash_EXECUTE_PAYMENT] paymentID={}", request.paymentID());
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }
//
//    @PostMapping("/cancel")
//    public ResponseEntity<?> cancel(@Valid @RequestBody BkashRefundRequest request) {
//        Object res = bkashPaymentService.cancelPayment(request.paymentID());
//        logger.info("[Bkash_CANCEL_PAYMENT] paymentID={}", request.paymentID());
//        return ResponseEntity.status(HttpStatus.OK).body(res);
//    }
//
//
//
//
//    @PostMapping("/refund")
//    public ResponseEntity<?> refund(@Valid @RequestBody BkashRefundRequest request) {
//       Object res = bkashPaymentService.refundPayment(request.paymentID());
//       logger.info("[Bkash_REFUND_PAYMENT] paymentID={}", request.paymentID());
//       return ResponseEntity.status(HttpStatus.OK).body(res);
//    }
//
//
//}

package com.mbstu.diningpass.meal.controller;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.request.payment.BkashRefundRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.BkashPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment/bkash")
@RequiredArgsConstructor
public class BkashPaymentController {

    private final BkashPaymentService bkashPaymentService;
    private final Logger logger = LoggerFactory.getLogger(BkashPaymentController.class);

    // React base URL for redirecting the browser after callback
    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ── STEP 1: Create Payment ────────────────────────────────────────────────
    // Called by React. Returns { paymentID, bkashURL } so React can redirect.
    @PostMapping("/create")
    public ResponseEntity<CutTokenResponse> create(
            @RequestHeader("X-User-Id")   UUID studentId,
            @RequestHeader("X-User-Role") Role role,
            @Valid @RequestBody CutTokenRequest request) {

        CutTokenResponse response = bkashPaymentService.createPayment(studentId, role, request);
        logger.info("[BKASH_CREATE] studentId={} mealDate={} mealTypes={}",
                studentId, request.mealDate(), request.mealTypes());
        return ResponseEntity.ok(response);
    }

    // ── STEP 2: bKash Callback (GET) ─────────────────────────────────────────
    // bKash redirects the student's BROWSER here after payment.
    // This is a server-side endpoint — NOT called by React fetch/axios.
    // Mirrors the original Node.js call_back() controller exactly.
    //
    // bKash sends: GET /api/payment/bkash/callback?paymentID=xxx&status=success
    //                                                              ^^^^^^^^^^^^
    //              status is: "success" | "cancel" | "failure"
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam(value = "paymentID",  required = false) String paymentID,
            @RequestParam(value = "status",     required = false) String status,
            @RequestParam(value = "apiVersion", required = false) String apiVersion) {

        logger.info("[BKASH_CALLBACK] paymentID={} status={}", paymentID, status);

        // ── Cancel or failure: redirect to React failure page ──────────────
        if ("cancel".equalsIgnoreCase(status) || "failure".equalsIgnoreCase(status)) {
            logger.warn("[BKASH_CALLBACK] cancelled/failed paymentID={} status={}", paymentID, status);

            // Mark the payment as FAILED in DB (non-blocking)
            if (paymentID != null && !paymentID.isBlank()) {
                try {
                    bkashPaymentService.cancelPayment(paymentID);
                } catch (Exception ex) {
                    logger.error("[BKASH_CALLBACK] cancelPayment failed paymentID={}: {}", paymentID, ex.getMessage());
                }
            }
            return redirect(frontendUrl + "/payment/failure?message=" + encode(status));
        }

        // ── Missing paymentID ─────────────────────────────────────────────
        if (paymentID == null || paymentID.isBlank()) {
            logger.error("[BKASH_CALLBACK] missing paymentID, status={}", status);
            return redirect(frontendUrl + "/payment/failure?message=missing_payment_id");
        }

        // ── Success: execute the payment server-side ───────────────────────
        // Mirrors: call_back() in the original Node.js code
        if ("success".equalsIgnoreCase(status)) {
            try {
                BkashExecutePaymentResponse result = bkashPaymentService.executePayment(paymentID);
                logger.info("[BKASH_CALLBACK] execute result paymentID={} status={} trxID={}",
                        paymentID, result.transactionStatus(), result.trxID());

                if (result.internalStatus().name().equals("COMPLETED")) {
                    // Redirect to React success page with payment details in query params
                    String successUrl = frontendUrl + "/payment/success"
                            + "?paymentID=" + encode(paymentID)
                            + "&trxID="    + encode(nullSafe(result.trxID()))
                            + "&status="   + encode(result.internalStatus().name());
                    return redirect(successUrl);
                } else {
                    return redirect(frontendUrl + "/payment/failure"
                            + "?paymentID=" + encode(paymentID)
                            + "&message="  + encode("Payment not completed: " + result.transactionStatus()));
                }

            } catch (Exception ex) {
                logger.error("[BKASH_CALLBACK] executePayment failed paymentID={}: {}", paymentID, ex.getMessage(), ex);
                return redirect(frontendUrl + "/payment/failure"
                        + "?paymentID=" + encode(paymentID)
                        + "&message="  + encode(ex.getMessage()));
            }
        }

        // ── Unknown status ────────────────────────────────────────────────
        logger.error("[BKASH_CALLBACK] unknown status={} paymentID={}", status, paymentID);
        return redirect(frontendUrl + "/payment/failure?message=unknown_status");
    }

    // ── STEP 3: Refund (admin only) ───────────────────────────────────────────
    @PostMapping("/refund")
    public ResponseEntity<?> refund(@Valid @RequestBody BkashRefundRequest request) {
        Map<String, Object> res = bkashPaymentService.refundPayment(request.paymentID());
        logger.info("[BKASH_REFUND] paymentID={}", request.paymentID());
        return ResponseEntity.ok(res);
    }

    // ── Cancel endpoint (student clicks back before paying) ──────────────────
    // Called by React when user cancels in the payment form BEFORE redirect,
    // or when the failure page loads and needs to clean up an INITIATED record.
    @PostMapping("/cancel")
    public ResponseEntity<?> cancel(@Valid @RequestBody BkashRefundRequest request) {
        Map<String, Object> res = bkashPaymentService.cancelPayment(request.paymentID());
        logger.info("[BKASH_CANCEL] paymentID={}", request.paymentID());
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private ResponseEntity<Void> redirect(String url) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }

    private String encode(String value) {
        if (value == null) return "";
        try {
            return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}