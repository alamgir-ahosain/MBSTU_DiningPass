package com.mbstu.diningpass.meal.dto.response.client;


import com.mbstu.diningpass.meal.enums.GenderType;

import java.time.LocalDateTime;
import java.util.UUID;


public record HallResponse(

        UUID id,
        String fullName,
        String shortName,
        GenderType genderType,
        String bkashNumber,
        String nagadNumber,
        String hallAdminId,
        boolean isActive,
        LocalDateTime createdAt
) { }
