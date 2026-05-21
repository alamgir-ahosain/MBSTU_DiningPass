package com.mbstu.diningpass.meal.dto.response.mealtoken;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.ScanMode;
import com.mbstu.diningpass.meal.enums.TokenStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record MealTokenStudentResponse(

        UUID        id,
        LocalDate   mealDate,
        MealType    mealType,
        String      mealMenu,
        String      tokenExpiry,            // Formatted time (AM/PM) - changed from LocalTime to avoid Redis serialization issues
        TokenStatus tokenStatus,
        String      qrCodeData             // null until APPROVED
) {}

