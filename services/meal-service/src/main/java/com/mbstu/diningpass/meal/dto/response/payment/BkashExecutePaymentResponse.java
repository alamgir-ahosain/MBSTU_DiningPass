package com.mbstu.diningpass.meal.dto.response.payment;

import com.mbstu.diningpass.meal.enums.PaymentStatus;

public record BkashExecutePaymentResponse(
        String transactionStatus,
        String trxID,
        PaymentStatus internalStatus
) {}