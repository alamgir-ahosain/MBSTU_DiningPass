//package com.mbstu.diningpass.meal.service.implementation;
//
//import com.mbstu.diningpass.meal.config.payment.BkashProperties;
//import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
//import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
//import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
//import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
//import com.mbstu.diningpass.meal.entity.MealConfig;
//import com.mbstu.diningpass.meal.entity.MealToken;
//import com.mbstu.diningpass.meal.entity.Payment;
//import com.mbstu.diningpass.meal.enums.*;
//import com.mbstu.diningpass.meal.exception.BadRequestException;
//import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
//import com.mbstu.diningpass.meal.repository.MealConfigRepository;
//import com.mbstu.diningpass.meal.repository.MealTokenRepository;
//import com.mbstu.diningpass.meal.client.StudentFeignClient;
//import com.mbstu.diningpass.meal.repository.PaymentRepository;
//import com.mbstu.diningpass.meal.service.abstraction.BkashPaymentService;
//import com.mbstu.diningpass.meal.service.abstraction.BkashTokenService;
//import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
//import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.core.ParameterizedTypeReference;
//import org.springframework.cache.annotation.CacheEvict;
//import org.springframework.cache.annotation.Caching;
//import org.springframework.http.HttpEntity;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpMethod;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.client.RestTemplate;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class BkashPaymentServiceImpl implements BkashPaymentService {
//
//    Logger logger = LoggerFactory.getLogger(BkashPaymentServiceImpl.class);
//    private final RestTemplate restTemplate;
//    private final BkashProperties props;
//    private final BkashTokenService bkashTokenService;
//    private final PaymentRepository paymentRepository;
//    private final MealTokenRepository mealTokenRepository;
//    private final MealConfigRepository mealConfigRepository;
//    private final StudentFeignClient studentFeignClient;
//    private final QrTokenService qrTokenService;
//    private final HallMealSummaryService hallMealSummaryService;
//    private final PaymentStatusService paymentStatusService;
//
//    private HttpHeaders bkashHeaders() {
//        HttpHeaders h = new HttpHeaders();
//        h.setContentType(MediaType.APPLICATION_JSON);
//        h.set("Authorization", bkashTokenService.getValidToken());
//        h.set("X-APP-Key", props.getApiKey());
//        return h;
//    }
//
//    // STEP 1: Create Payment
//    @Override
//    @Transactional
//    public CutTokenResponse createPayment(UUID studentId, Role role, CutTokenRequest request) {
//        logger.info("meal-service/bkashPayment: DB CALL for createPayment");
//
//        StudentProfileResponse profile = studentFeignClient.getProfile();
//        validateMealRequest(studentId, profile.hallShortName(), request.mealDate(), request.mealTypes());
//
//        long totalAmount = 0L;
//        for (MealType mealType : request.mealTypes()) {
//            MealConfig cfg = mealConfigRepository
//                    .findByHallShortNameAndMealDateAndMealType(profile.hallShortName(), request.mealDate(), mealType)
//                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));
//            totalAmount += cfg.getMealPrice();
//        }
//
//        String invoiceNo = "DINING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
//        Map<String, String> body = new HashMap<>();
//        body.put("mode", "0011");
//        body.put("payerReference", studentId.toString());
//        body.put("callbackURL", props.getCallbackUrl());
//        body.put("amount", String.valueOf(totalAmount));
//        body.put("currency", "BDT");
//        body.put("intent", "sale");
//        body.put("merchantInvoiceNumber", invoiceNo);
//
//        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
//                props.getCreatePaymentUrl(),
//                HttpMethod.POST,
//                new HttpEntity<>(body, bkashHeaders()),
//                new ParameterizedTypeReference<Map<String, Object>>() {});
//
//        Map<String, Object> responseBody = requireBody(response.getBody(), "create payment");
//        String bkashPaymentId = stringValue(responseBody, "paymentID");
//        String bkashURL = stringValue(responseBody, "bkashURL");
//
//
//        Payment payment = Payment.builder()
//                .studentId(studentId)
//                .hallShortName(profile.hallShortName())
//                .mealDate(request.mealDate())
//                .mealTypes(request.mealTypes())
//                .paymentMethod(PaymentMethod.BKASH)
//                .totalAmount(totalAmount)
//                .bkashPaymentId(bkashPaymentId)
//                .merchantInvoiceNo(invoiceNo)
//                .paymentStatus(PaymentStatus.INITIATED)
//                .build();
//
//
//        logger.info("saving payment details to DB: studentId={}, hallShortName={}, mealDate={}, mealTypes={}, totalAmount={}, bkashPaymentId={}",
//                payment.getStudentId(), payment.getHallShortName(), payment.getMealDate(), payment.getMealTypes(), payment.getTotalAmount(), payment.getBkashPaymentId());
//
//        paymentRepository.save(payment);
//        logger.info("Payment created for studentId={}, bkashPaymentId={}", studentId, bkashPaymentId);
//        logger.info("bkashURL={}", bkashURL);
//        return new CutTokenResponse(bkashPaymentId, bkashURL);
//    }
//
//
//    public void validateMealRequest(UUID studentId, String hallShortName, LocalDate mealDate, List<MealType> mealTypes) {
//        for (MealType mealType : mealTypes) {
//            MealConfig mealConfig = mealConfigRepository
//                    .findByHallShortNameAndMealDateAndMealType(hallShortName, mealDate, mealType)
//                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));
//
//            validateBookingOpen(mealConfig, mealType);
//            boolean pendingExists = paymentRepository.existsMealRequest(
//                    studentId, mealDate, mealType,
//                    List.of(PaymentStatus.INITIATED)
//            );
//            if (pendingExists) throw new BadRequestException("You already have a pending request for " + mealType);
//
//            boolean approvedTokenExists = mealTokenRepository.existsByStudentIdAndMealDateAndMealType(
//                    studentId, mealDate, mealType);
//            if (approvedTokenExists) throw new BadRequestException("Token already exists for " + mealType);
//        }
//    }
//
//    private void validateBookingOpen(MealConfig mealConfig, MealType mealType) {
//        if (!mealConfig.isActive()) {
//            throw new BadRequestException("Booking for " + mealType + " on " + mealConfig.getMealDate() + " is not available");
//        }
//
//        LocalDateTime cutoff = LocalDateTime.of(mealConfig.getMealDate(), mealConfig.getCutTokenBefore());
//        LocalDateTime now = LocalDateTime.now();
//        if (!now.isBefore(cutoff)) {
//            throw new BadRequestException("Booking window for " + mealType + " has closed. Deadline was " + cutoff);
//        }
//    }
//
//
//
//    // STEP 2: Execute Payment (after bKash redirect)
//    @Override
//    @Transactional
//    @Caching(evict = {
//            @CacheEvict(value = "mealTokens", allEntries = true),
//            @CacheEvict(value = "mealConfigs", allEntries = true)
//    })
//    public BkashExecutePaymentResponse executePayment(String bkashPaymentId) {
//        logger.info("meal-service/bkashPayment: DIRECT DB CALL for executePayment");
//
//        Payment payment = paymentRepository
//                .findByBkashPaymentId(bkashPaymentId)
//                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
//
//        if (payment.getPaymentStatus() != PaymentStatus.INITIATED) {
//            throw new BadRequestException("Payment already processed: " + payment.getPaymentStatus());
//        }
//
//        ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
//                props.getExecutePaymentUrl(),
//                HttpMethod.POST,
//                new HttpEntity<>(Map.of("paymentID", bkashPaymentId), bkashHeaders()),
//                new ParameterizedTypeReference<Map<String, Object>>() {});
//
//        Map<String, Object> result = requireBody(resp.getBody(), "execute payment");
//        logger.info("BKASH EXECUTE RESPONSE: {}", result);
//
//        String txStatus = stringValueOrDefault(result, "transactionStatus", "Failed");
//        String trxId = stringValue(result, "trxID");
//        String msisdn = stringValue(result, "customerMsisdn");
//
//        payment.setBkashTrxId(trxId);
//        payment.setCustomerMsisdn(msisdn);
//
//        if ("Completed".equalsIgnoreCase(txStatus)) {
//            // Persist completed status immediately in a separate transaction so
//            // that subsequent processing failures do not roll back the status update.
//            payment.setPaymentStatus(PaymentStatus.COMPLETED);
//            paymentStatusService.save(payment);
//
//            // Process tokens and summaries. Do not let failures here abort the
//            // payment status update; log and continue.
//            for (MealType mealType : payment.getMealTypes()) {
//                try {
//                    MealConfig mealConfig = mealConfigRepository
//                            .findByHallShortNameAndMealDateAndMealType(payment.getHallShortName(), payment.getMealDate(), mealType)
//                            .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));
//
//                    mealConfig.setTotalSold(mealConfig.getTotalSold() + 1);
//                    mealConfigRepository.save(mealConfig);
//
//                    MealToken token = MealToken.builder()
//                            .paymentId(payment.getId())
//                            .studentId(payment.getStudentId())
//                            .hallShortName(payment.getHallShortName())
//                            .mealDate(payment.getMealDate())
//                            .mealType(mealType)
//                            .mealPrice(mealConfig.getMealPrice())
//                            .tokenStatus(TokenStatus.APPROVED)
//                            .build();
//
//                    MealToken saved = mealTokenRepository.save(token);
//                    String qrData = qrTokenService.generateMealQrToken(saved, mealConfig.getTokenExpires());
//                    saved.setQrCodeData(qrData);
//                    saved.setQrGeneratedAt(LocalDateTime.now());
//                    mealTokenRepository.save(saved);
//
//                    try {
//                        hallMealSummaryService.onPaymentApproved(
//                                payment.getHallShortName(),
//                                payment.getMealDate(),
//                                mealType,
//                                mealConfig.getMealPrice(),
//                                mealConfig.getMealMenu(),
//                                mealConfig.getFeastNote()
//                        );
//                    } catch (Exception ex) {
//                        logger.error("Failed to update hall meal summary for payment={} mealType={}: {}", bkashPaymentId, mealType, ex.getMessage(), ex);
//                    }
//                } catch (Exception ex) {
//                    // Log and continue processing other meal types; payment status
//                    // has already been persisted.
//                    logger.error("Failed to process token for payment={} mealType={}: {}", bkashPaymentId, mealType, ex.getMessage(), ex);
//                }
//            }
//        } else {
//            payment.setPaymentStatus(PaymentStatus.FAILED);
//            paymentStatusService.save(payment);
//        }
//        return new BkashExecutePaymentResponse(txStatus, trxId, payment.getPaymentStatus());
//    }
//
//    // STEP 2.5: Cancel Payment (student returned from bKash without paying)
//    @Override
//    @Transactional
//    public Map<String, Object> cancelPayment(String bkashPaymentId) {
//        logger.info("meal-service/bkashPayment: DIRECT DB CALL for cancelPayment");
//
//        Payment payment = paymentRepository
//                .findByBkashPaymentId(bkashPaymentId)
//                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
//
//        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
//            throw new BadRequestException("Completed payment cannot be cancelled");
//        }
//        if (payment.getPaymentStatus() == PaymentStatus.REFUNDED) {
//            throw new BadRequestException("Refunded payment cannot be cancelled");
//        }
//
//        payment.setPaymentStatus(PaymentStatus.FAILED);
//        paymentRepository.save(payment);
//
//        return Map.of(
//                "paymentID", bkashPaymentId,
//                "status", payment.getPaymentStatus(),
//                "message", "Payment cancelled. You can start again."
//        );
//    }
//
//    // STEP 3: Refund (admin only)
//    @Override
//    @Transactional
//    public Map<String, Object> refundPayment(String bkashPaymentId) {
//        logger.info("meal-service/bkashPayment: DIRECT DB CALL for refundPayment");
//        Payment payment = paymentRepository
//                .findByBkashPaymentId(bkashPaymentId)
//                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
//
//        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED)
//            throw new BadRequestException("Only COMPLETED payments can be refunded");
//
//        Map<String, String> body = new HashMap<>();
//        body.put("paymentID", bkashPaymentId);
//        body.put("trxID", payment.getBkashTrxId());
//        body.put("amount", String.valueOf(payment.getTotalAmount()));
//        body.put("currency", "BDT");
//        body.put("reason", "Student refund");
//
//        ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
//                props.getRefundUrl(),
//                HttpMethod.POST,
//                new HttpEntity<>(body, bkashHeaders()),
//                new ParameterizedTypeReference<Map<String, Object>>() {});
//        payment.setPaymentStatus(PaymentStatus.REFUNDED);
//        paymentRepository.save(payment);
//        return requireBody(resp.getBody(), "refund payment");
//    }
//
//    private Map<String, Object> requireBody(Map<String, Object> body, String action) {
//        if (body == null) {
//            throw new IllegalStateException("bKash " + action + " response body was null");
//        }
//        return body;
//    }
//
//    private String stringValue(Map<String, Object> data, String key) {
//        Object value = data.get(key);
//        return value == null ? null : value.toString();
//    }
//
//    private String stringValueOrDefault(Map<String, Object> data, String key, String defaultValue) {
//        String value = stringValue(data, key);
//        return value == null || value.isBlank() ? defaultValue : value;
//    }
//}



package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.config.payment.BkashProperties;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.*;
import com.mbstu.diningpass.meal.exception.BadRequestException;
import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.BkashPaymentService;
import com.mbstu.diningpass.meal.service.abstraction.BkashTokenService;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BkashPaymentServiceImpl implements BkashPaymentService {

    private final Logger logger = LoggerFactory.getLogger(BkashPaymentServiceImpl.class);
    private final RestTemplate restTemplate;
    private final BkashProperties props;
    private final BkashTokenService bkashTokenService;
    private final PaymentRepository paymentRepository;
    private final MealTokenRepository mealTokenRepository;
    private final MealConfigRepository mealConfigRepository;
    private final StudentFeignClient studentFeignClient;
    private final QrTokenService qrTokenService;
    private final HallMealSummaryService hallMealSummaryService;
    private final PaymentStatusService paymentStatusService;

    // ── Shared bKash request headers ─────────────────────────────────────────
    private HttpHeaders bkashHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("Authorization", bkashTokenService.getValidToken());
        h.set("X-APP-Key", props.getApiKey());
        return h;
    }

    // ── STEP 1: Create Payment ────────────────────────────────────────────────
    // Called by React. Validates the meal request, calls bKash create API,
    // saves an INITIATED payment record, returns { paymentID, bkashURL }.
    // React then does: window.location.assign(bkashURL)
    // bKash will redirect the browser to props.getCallbackUrl() (backend URL).
    @Override
    @Transactional
    public CutTokenResponse createPayment(UUID studentId, Role role, CutTokenRequest request) {
        logger.info("[BKASH_CREATE] studentId={} mealDate={} mealTypes={}",
                studentId, request.mealDate(), request.mealTypes());

        StudentProfileResponse profile = studentFeignClient.getProfile();

        // Reuse all existing booking validations
        validateMealRequest(studentId, profile.hallShortName(), request.mealDate(), request.mealTypes());

        // Sum up total amount from MealConfigs
        long totalAmount = 0L;
        for (MealType mealType : request.mealTypes()) {
            MealConfig cfg = mealConfigRepository
                    .findByHallShortNameAndMealDateAndMealType(
                            profile.hallShortName(), request.mealDate(), mealType)
                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found for " + mealType));
            totalAmount += cfg.getMealPrice();
        }

        String invoiceNo = "DINING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Build bKash create payment request body
        Map<String, String> body = new HashMap<>();
        body.put("mode",                  "0011");
        body.put("payerReference",        studentId.toString());
        body.put("callbackURL",           props.getCallbackUrl()); // ← backend callback URL
        body.put("amount",                String.valueOf(totalAmount));
        body.put("currency",              "BDT");
        body.put("intent",                "sale");
        body.put("merchantInvoiceNumber", invoiceNo);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                props.getCreatePaymentUrl(),
                HttpMethod.POST,
                new HttpEntity<>(body, bkashHeaders()),
                new ParameterizedTypeReference<>() {});

        Map<String, Object> responseBody = requireBody(response.getBody(), "create payment");
        String bkashPaymentId = stringValue(responseBody, "paymentID");
        String bkashURL       = stringValue(responseBody, "bkashURL");

        logger.info("[BKASH_CREATE] bkashPaymentId={} bkashURL={}", bkashPaymentId, bkashURL);

        // Save INITIATED payment — no token yet, waiting for bKash callback
        Payment payment = Payment.builder()
                .studentId(studentId)
                .hallShortName(profile.hallShortName())
                .mealDate(request.mealDate())
                .mealTypes(request.mealTypes())
                .paymentMethod(PaymentMethod.BKASH)
                .totalAmount(totalAmount)
                .bkashPaymentId(bkashPaymentId)
                .merchantInvoiceNo(invoiceNo)
                .paymentStatus(PaymentStatus.INITIATED)
                .build();
        paymentRepository.save(payment);

        return new CutTokenResponse(bkashPaymentId, bkashURL);
    }

    // ── STEP 2: Execute Payment ───────────────────────────────────────────────
    // Called INTERNALLY by BkashPaymentController.callback() after bKash
    // redirects the student's browser to the backend callback URL.
    // Mirrors call_back() execute logic in the original Node.js code.
    // NOT called by React directly anymore.
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "mealTokens",  allEntries = true),
            @CacheEvict(value = "mealConfigs", allEntries = true)
    })
    public BkashExecutePaymentResponse executePayment(String bkashPaymentId) {
        logger.info("[BKASH_EXECUTE] bkashPaymentId={}", bkashPaymentId);

        // Idempotency guard — prevent double execution if callback is called twice
        Payment payment = paymentRepository
                .findByBkashPaymentId(bkashPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + bkashPaymentId));

        if (payment.getPaymentStatus() != PaymentStatus.INITIATED) {
            logger.warn("[BKASH_EXECUTE] already processed paymentId={} status={}",
                    bkashPaymentId, payment.getPaymentStatus());
            throw new BadRequestException("Payment already processed: " + payment.getPaymentStatus());
        }

        // Call bKash Execute Payment API
        ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                props.getExecutePaymentUrl(),
                HttpMethod.POST,
                new HttpEntity<>(Map.of("paymentID", bkashPaymentId), bkashHeaders()),
                new ParameterizedTypeReference<>() {});

        Map<String, Object> result = requireBody(resp.getBody(), "execute payment");
        logger.info("[BKASH_EXECUTE] bKash response: {}", result);

        String txStatus = stringValueOrDefault(result, "transactionStatus", "Failed");
        String trxId    = stringValue(result, "trxID");
        String msisdn   = stringValue(result, "customerMsisdn");

        payment.setBkashTrxId(trxId);
        payment.setCustomerMsisdn(msisdn);

        if ("Completed".equalsIgnoreCase(txStatus)) {
            // Persist COMPLETED status first in its own transaction so that any
            // subsequent token-creation failures do not roll back the payment status.
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            paymentStatusService.save(payment);
            logger.info("[BKASH_EXECUTE] payment COMPLETED paymentId={} trxId={}", bkashPaymentId, trxId);

            // Create one MealToken per requested meal type — same logic as manual approvePayment()
            for (MealType mealType : payment.getMealTypes()) {
                try {
                    MealConfig mealConfig = mealConfigRepository
                            .findByHallShortNameAndMealDateAndMealType(
                                    payment.getHallShortName(), payment.getMealDate(), mealType)
                            .orElseThrow(() -> new ResourceNotFoundException("Meal config not found for " + mealType));

                    mealConfig.setTotalSold(mealConfig.getTotalSold() + 1);
                    mealConfigRepository.save(mealConfig);

                    MealToken token = MealToken.builder()
                            .paymentId(payment.getId())
                            .studentId(payment.getStudentId())
                            .hallShortName(payment.getHallShortName())
                            .mealDate(payment.getMealDate())
                            .mealType(mealType)
                            .mealPrice(mealConfig.getMealPrice())
                            .tokenStatus(TokenStatus.APPROVED)
                            .build();

                    MealToken saved = mealTokenRepository.save(token);
                    String qrData = qrTokenService.generateMealQrToken(saved, mealConfig.getTokenExpires());
                    saved.setQrCodeData(qrData);
                    saved.setQrGeneratedAt(LocalDateTime.now());
                    mealTokenRepository.save(saved);

                    logger.info("[BKASH_EXECUTE] token created tokenId={} mealType={}", saved.getId(), mealType);

                    try {
                        hallMealSummaryService.onPaymentApproved(
                                payment.getHallShortName(),
                                payment.getMealDate(),
                                mealType,
                                mealConfig.getMealPrice(),
                                mealConfig.getMealMenu(),
                                mealConfig.getFeastNote()
                        );
                    } catch (Exception ex) {
                        logger.error("[BKASH_EXECUTE] hallMealSummary failed mealType={}: {}", mealType, ex.getMessage());
                    }

                } catch (Exception ex) {
                    // Log and continue — payment status already persisted as COMPLETED
                    logger.error("[BKASH_EXECUTE] token creation failed mealType={}: {}", mealType, ex.getMessage(), ex);
                }
            }

        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentStatusService.save(payment);
            logger.warn("[BKASH_EXECUTE] payment FAILED paymentId={} txStatus={}", bkashPaymentId, txStatus);
        }

        return new BkashExecutePaymentResponse(txStatus, trxId, payment.getPaymentStatus());
    }

    // ── Cancel Payment ────────────────────────────────────────────────────────
    // Called when student closes bKash page without paying, or bKash returns
    // status=cancel. Marks the INITIATED payment as FAILED so the student
    // can try again (validateMealRequest checks for INITIATED, not FAILED).
    @Override
    @Transactional
    public Map<String, Object> cancelPayment(String bkashPaymentId) {
        logger.info("[BKASH_CANCEL] bkashPaymentId={}", bkashPaymentId);

        Payment payment = paymentRepository
                .findByBkashPaymentId(bkashPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + bkashPaymentId));

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new BadRequestException("Completed payment cannot be cancelled. Use refund instead.");
        }
        if (payment.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("Refunded payment cannot be cancelled.");
        }

        payment.setPaymentStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
        logger.info("[BKASH_CANCEL] marked FAILED paymentId={}", bkashPaymentId);

        return Map.of(
                "paymentID", bkashPaymentId,
                "status",    payment.getPaymentStatus().name(),
                "message",   "Payment cancelled. You may try again."
        );
    }

    // ── Refund Payment (admin only) ───────────────────────────────────────────
    @Override
    @Transactional
    public Map<String, Object> refundPayment(String bkashPaymentId) {
        logger.info("[BKASH_REFUND] bkashPaymentId={}", bkashPaymentId);

        Payment payment = paymentRepository
                .findByBkashPaymentId(bkashPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + bkashPaymentId));

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new BadRequestException("Only COMPLETED payments can be refunded. Current: " + payment.getPaymentStatus());
        }

        Map<String, String> body = new HashMap<>();
        body.put("paymentID", bkashPaymentId);
        body.put("trxID",     payment.getBkashTrxId());
        body.put("amount",    String.valueOf(payment.getTotalAmount()));
        body.put("currency",  "BDT");
        body.put("reason",    "Student refund");

        ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                props.getRefundUrl(),
                HttpMethod.POST,
                new HttpEntity<>(body, bkashHeaders()),
                new ParameterizedTypeReference<>() {});

        Map<String, Object> refundResult = requireBody(resp.getBody(), "refund payment");

        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
        logger.info("[BKASH_REFUND] refunded paymentId={}", bkashPaymentId);

        return refundResult;
    }

    // ── Validation (shared with direct validation if needed) ─────────────────
    public void validateMealRequest(UUID studentId, String hallShortName,
                                    LocalDate mealDate, List<MealType> mealTypes) {
        for (MealType mealType : mealTypes) {
            MealConfig mealConfig = mealConfigRepository
                    .findByHallShortNameAndMealDateAndMealType(hallShortName, mealDate, mealType)
                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found for " + mealType));

            validateBookingOpen(mealConfig, mealType);

            // Block if an INITIATED payment already exists (bKash page open in another tab)
            boolean pendingExists = paymentRepository.existsMealRequest(
                    studentId, mealDate, mealType, List.of(PaymentStatus.INITIATED));
            if (pendingExists) {
                throw new BadRequestException("You already have a pending bKash session for " + mealType
                        + ". Please complete or wait for it to expire.");
            }

            // Block if token already exists
            boolean tokenExists = mealTokenRepository
                    .existsByStudentIdAndMealDateAndMealType(studentId, mealDate, mealType);
            if (tokenExists) {
                throw new BadRequestException("Token already exists for " + mealType
                        + " on " + mealDate);
            }
        }
    }

    private void validateBookingOpen(MealConfig mealConfig, MealType mealType) {
        if (!mealConfig.isActive()) {
            throw new BadRequestException("Booking for " + mealType
                    + " on " + mealConfig.getMealDate() + " is not active.");
        }
        LocalDateTime cutoff = LocalDateTime.of(mealConfig.getMealDate(), mealConfig.getCutTokenBefore());
        if (!LocalDateTime.now().isBefore(cutoff)) {
            throw new BadRequestException("Booking window for " + mealType
                    + " has closed. Deadline was " + cutoff);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Map<String, Object> requireBody(Map<String, Object> body, String action) {
        if (body == null) throw new IllegalStateException("bKash " + action + " returned null body");
        return body;
    }

    private String stringValue(Map<String, Object> data, String key) {
        Object v = data.get(key);
        return v == null ? null : v.toString();
    }

    private String stringValueOrDefault(Map<String, Object> data, String key, String def) {
        String v = stringValue(data, key);
        return (v == null || v.isBlank()) ? def : v;
    }
}