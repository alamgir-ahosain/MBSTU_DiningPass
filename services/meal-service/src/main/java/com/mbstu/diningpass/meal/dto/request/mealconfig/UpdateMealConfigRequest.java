package com.mbstu.diningpass.meal.dto.request.mealconfig;

import com.mbstu.diningpass.meal.enums.MealType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.*;

public record UpdateMealConfigRequest(

        @NotBlank(message = "Menu description is required")
        @Size(max = 255, message = "Menu description must not exceed 255 characters")
        String mealMenu,

        Long mealPrice,
        LocalTime cutTokenBefore,
        LocalTime tokenExpires,
        Boolean isActive,

        @Size(max = 255, message = "Feast note must not exceed 255 characters")
        String feastNote     // optional — null for regular days


) {}
