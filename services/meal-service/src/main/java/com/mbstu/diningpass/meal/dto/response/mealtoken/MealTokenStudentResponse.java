package com.mbstu.diningpass.meal.dto.response.mealtoken;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.ScanMode;
import com.mbstu.diningpass.meal.enums.TokenStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record MealTokenStudentResponse(

        UUID        id,
        String      hallShortName,
        LocalDate   mealDate,
        MealType    mealType,
        Long        mealPrice,
        String      mealMenu,
        TokenStatus tokenStatus,
        String      qrCodeData,             // null until APPROVED
        LocalDateTime qrGeneratedAt,
        ScanMode    scanMode,               // null until scanned
        LocalDateTime usedAt               // null until USED

) {}

