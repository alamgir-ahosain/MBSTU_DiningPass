package com.mbstu.diningpass.meal.dto.response.qr;

import com.mbstu.diningpass.meal.enums.MealType;

import java.time.LocalDate;
import java.util.UUID;

public record QrClaims(
        UUID tokenId,
        UUID studentId,
        String hallShortName,
        LocalDate mealDate,
        MealType mealType
) {}