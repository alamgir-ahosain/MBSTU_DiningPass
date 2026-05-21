package com.mbstu.diningpass.meal.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PaymentRejectRequest(

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 255, message = "Rejection reason must not exceed 255 characters")
    String rejectionReason
){}
