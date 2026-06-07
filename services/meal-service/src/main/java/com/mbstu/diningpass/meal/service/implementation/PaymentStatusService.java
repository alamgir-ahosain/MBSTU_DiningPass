package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helper service to persist payment status in a separate transaction.
 * This ensures the payment status update is committed even if later
 * processing (token creation / summary updates) fails and would
 * otherwise roll back the surrounding transaction.
 */
@Service
@RequiredArgsConstructor
public class PaymentStatusService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentStatusService.class);

    private final PaymentRepository paymentRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Payment save(Payment payment) {
        logger.info("Persisting payment status in new transaction — id={} bkashPaymentId={} status={}", payment.getId(), payment.getBkashPaymentId(), payment.getPaymentStatus());
        return paymentRepository.save(payment);
    }
}

