package com.mbstu.diningpass.meal.dto.response.summary;

import com.mbstu.diningpass.meal.enums.MealType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record HallMealSummaryResponse(

        UUID      id,
        String    hallShortName,
        LocalDate mealDate,
        MealType  mealType,
        String    mealMenu,
        String    feastNote,
        Long      mealPrice,
        Long      totalTokensSold,
        Long      totalTokensUsed,
        Long      totalTokensUnused,
        Long      totalRevenue,
        boolean   isFinalized,
        LocalDateTime finalizedAt,
        LocalDateTime createdAt

) {}