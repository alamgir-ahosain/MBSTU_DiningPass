package com.mbstu.diningpass.auth.dto.response.hall;

import com.mbstu.diningpass.auth.enums.GenderType;
import lombok.Builder;

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
