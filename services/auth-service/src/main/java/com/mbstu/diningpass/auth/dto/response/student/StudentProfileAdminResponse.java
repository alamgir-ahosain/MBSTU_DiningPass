package com.mbstu.diningpass.auth.dto.response.student;

import java.util.UUID;

public record StudentProfileAdminResponse(
        UUID id,
        String studentId,
        String fullName,
        String email,
        String hallShortName,
        String roomNumber,
        String department,
        boolean isActive
) { }
