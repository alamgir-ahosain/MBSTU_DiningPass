package com.mbstu.diningpass.auth.dto.request.student;

import com.mbstu.diningpass.auth.enums.GenderType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateStudentProfileRequest(

        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @Size(max = 15, message = "Room number must not exceed 15 characters")
        String roomNumber
) {
}
