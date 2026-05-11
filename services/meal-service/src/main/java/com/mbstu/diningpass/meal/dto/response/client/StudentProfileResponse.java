package com.mbstu.diningpass.meal.dto.response.client;


import com.mbstu.diningpass.meal.enums.GenderType;
import com.mbstu.diningpass.meal.enums.Role;

import java.time.LocalDateTime;

public record StudentProfileResponse(


        String studentId,
        String fullName,
        String email,
        Role role,
        String hallShortName,
        String roomNumber,
        String department,
        GenderType gender,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){}


