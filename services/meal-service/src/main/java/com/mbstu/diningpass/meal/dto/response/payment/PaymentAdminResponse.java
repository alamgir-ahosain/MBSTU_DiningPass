package com.mbstu.diningpass.meal.dto.response.payment;

import jakarta.persistence.Column;

import java.time.LocalDateTime;

public record PaymentAdminResponse(

         String verifiedByName,            // snapshot at verification time
         LocalDateTime verifiedAt          // snapshot at verification time
) {}
