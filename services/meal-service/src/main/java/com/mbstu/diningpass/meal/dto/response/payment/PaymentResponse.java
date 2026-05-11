package com.mbstu.diningpass.meal.dto.response.payment;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PaymentResponse(


        UUID          id,
        UUID          studentId,
        String        hallShortName,
        LocalDate     mealDate,
        List<MealType> mealTypes,
        Long          totalAmount,
        PaymentMethod paymentMethod,
        String        senderNumber,
        String        screenshotUrl,
        PaymentStatus paymentStatus,
        String        rejectionReason,     // null unless REJECTED
        String        verifiedByName,
        LocalDateTime verifiedAt,          // null until admin acts
        LocalDateTime submittedAt
) { }