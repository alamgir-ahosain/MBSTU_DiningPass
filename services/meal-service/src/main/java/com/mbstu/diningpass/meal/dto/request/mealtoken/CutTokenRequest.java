package com.mbstu.diningpass.meal.dto.request.mealtoken;


import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;


public record CutTokenRequest(

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,                // BKASH | NAGAD | ROCKET | CASH

        @NotNull(message = "Meal date is required")
        @FutureOrPresent(message = "Meal date must be today or a future date")
         LocalDate mealDate,

        // One or two meal types — [LUNCH], [DINNER], or [LUNCH, DINNER]
        @NotEmpty(message = "At least one meal type must be selected")
        @Size(max = 2, message = "Cannot select more than two meal types")
        List<@NotNull MealType> mealTypes

){}
