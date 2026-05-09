package com.mbstu.diningpass.meal.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record RejectPaymentRequest(

    @NotNull(message = "Payment ID is required")
    UUID paymentId,

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 255, message = "Rejection reason must not exceed 255 characters")
    String rejectionReason
){}
