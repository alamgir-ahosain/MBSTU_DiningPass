package com.mbstu.diningpass.meal.controller;


import com.mbstu.diningpass.meal.dto.response.payment.PaymentAdminResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.PaymentService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final Logger logger= LoggerFactory.getLogger(PaymentController.class);


    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Meal-Service: Payment Controller is working!");
    }

    // HALL_ADMIN / HALL_STAFF approves a payment → generates QR tokens
    @PatchMapping("/{id}/approve")
    public ResponseEntity<PaymentAdminResponse> approvePayment(
            @RequestHeader("X-User-Id")   UUID requesterId,
            @RequestHeader("X-User-Role") Role role,
            @PathVariable UUID id) {

        PaymentAdminResponse response = paymentService.approvePayment(requesterId, role, id);
        logger.info("[APPROVE_PAYMENT] requester={} role={} paymentId={}", requesterId, role, id);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }




















    // HALL_ADMIN / HALL_STAFF rejects a payment with a reason
//    @PatchMapping("/{id}/reject")
//    public ResponseEntity<PaymentAdminResponse> rejectPayment(
//            @RequestHeader("X-User-Id")   UUID requesterId,
//            @RequestHeader("X-User-Role") Role role,
//            @PathVariable UUID id,
//            @Valid @RequestBody RejectPaymentRequest request
//    ) {
//        PaymentAdminResponse response = paymentService.rejectPayment(requesterId, role, id, request);
//        return ResponseEntity.ok(response);
//    }
}