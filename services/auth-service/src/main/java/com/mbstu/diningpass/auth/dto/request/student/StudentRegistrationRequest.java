package com.mbstu.diningpass.auth.dto.request.student;

import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record StudentRegistrationRequest(


        @NotBlank(message = "Student ID cannot be blank")
        @Size(max = 20, message = "Student ID must not exceed 20 characters")
        String studentId,

        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Invalid email format")
        @Size(max = 150)
        String email,

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,


       @NotBlank(message = "Short name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String hallShortName,

        @Size(max = 15, message = "Room number must not exceed 15 characters")
        String roomNumber,

        @NotBlank(message = "Department cannot be blank")
        @Size(max = 60)
        String department,

        @NotNull(message = "Gender is required")
        GenderType gender
) { }
