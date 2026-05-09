package com.mbstu.diningpass.meal.dto.request.mealconfig;


import com.mbstu.diningpass.meal.enums.MealType;
import jakarta.validation.constraints.*;

import java.time.*;
public record CreateMealConfigRequest(



    @NotNull(message = "Meal date is required")
    @FutureOrPresent(message = "Meal date must be today or a future date")
    LocalDate mealDate,

    @NotNull(message = "Meal type is required")
    MealType mealType,

    @NotBlank(message = "Menu description is required")
    @Size(max = 255, message = "Menu description must not exceed 255 characters")
    String mealMenu,

    @NotNull(message = "Meal price is required")
    Long mealPrice,

    @NotNull(message = "Token booking deadline (cutTokenBefore) is required")
    LocalTime cutTokenBefore,

    @NotNull(message = "Token expiry time is required")
    LocalTime tokenExpires,

    @Size(max = 255, message = "Feast note must not exceed 255 characters")
    String feastNote     // optional — null for regular days

) {}
