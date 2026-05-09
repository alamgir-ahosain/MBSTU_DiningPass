package com.mbstu.diningpass.meal.dto.response.payment;

import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(

        UUID          id,
        String        hallShortName,
        LocalDate     mealDate,
        PaymentMethod paymentMethod,
        String        senderNumber,
        String        receiverNumber,
        String        transactionId,
        Long          totalAmount,
        String        screenshotUrl,
        PaymentStatus paymentStatus,
        String        rejectionReason,     // null unless REJECTED
        LocalDateTime verifiedAt,          // null until admin acts
        LocalDateTime submittedAt

) {}