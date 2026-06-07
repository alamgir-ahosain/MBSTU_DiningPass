package com.mbstu.diningpass.meal.dto.request.payment;

import jakarta.validation.constraints.NotBlank;

public record BkashRefundRequest(
        @NotBlank String paymentID
) {}
