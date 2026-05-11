package com.mbstu.diningpass.meal.dto.response.mealconfig;

import java.time.LocalDateTime;
import com.mbstu.diningpass.meal.enums.MealType;

import java.time.*;
import java.util.*;
public record MealConfigAdminResponse(

        UUID      id,
        String    hallShortName,
        LocalDate mealDate,
        MealType  mealType,
        String    mealMenu,
        Long      mealPrice,
        LocalTime cutTokenBefore,
        LocalTime tokenExpires,
        boolean   isActive,
        String    feastNote,
        boolean   isBookingOpen,    // computed: now < cutTokenBefore && mealDate >= today
        boolean   isTokenValid,      // computed: now < tokenExpires && mealDate >= today
        String    createdByName,    // snapshot — who created this config
        String    updatedByName,    // snapshot — who last updated this config
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}

