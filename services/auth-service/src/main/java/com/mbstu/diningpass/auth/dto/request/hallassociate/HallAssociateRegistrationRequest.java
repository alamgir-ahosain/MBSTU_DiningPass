package com.mbstu.diningpass.auth.dto.request.hallassociate;

import com.mbstu.diningpass.auth.enums.Role;
import jakarta.validation.constraints.*;

import java.util.UUID;

public record HallAssociateRegistrationRequest(



        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        @Size(max = 15, message = "phone number must not exceed 15 characters")
        String phone,

        @NotNull(message = "Role is required")
        Role role,

        @NotBlank(message = "Short name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String hallShortName
){}
