package com.mbstu.diningpass.meal.dto.response.mealtoken;


import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CutTokenResponse(


        PaymentStatus paymentStatus,        // always SUBMITTED after cut token
        LocalDateTime submittedAt          // timestamp of token cutting (payment submission time)
) {}