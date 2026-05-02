package com.mbstu.diningpass.auth.dto.response.student;

import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record StudentResponse (

        UUID id,
        String studentId,
        String fullName,
        String email,
        Role role,
        UUID hallId,
        String roomNumber,
        String department,
        GenderType gender,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

){}


