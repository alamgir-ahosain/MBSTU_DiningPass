package com.mbstu.diningpass.meal.dto.response.mealconfig;

import com.mbstu.diningpass.meal.enums.MealType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record MealConfigResponse(
        UUID id,
        String    hallShortName,
        LocalDate mealDate,
        MealType mealType,
        String    mealMenu,
        Long      mealPrice,
        LocalTime cutTokenBefore,
        LocalTime tokenExpires,
        boolean   isActive,
        String    feastNote,
        boolean   isBookingOpen,        // computed: now < cutTokenBefore && mealDate >= today
        LocalDateTime createdAt
) { }
