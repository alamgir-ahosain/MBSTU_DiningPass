package com.mbstu.diningpass.meal.dto.request.payment;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ApprovePaymentRequest(

    @NotNull(message = "Payment ID is required")
    UUID paymentId
){}
