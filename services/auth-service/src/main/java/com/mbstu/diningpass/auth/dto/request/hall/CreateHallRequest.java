package com.mbstu.diningpass.auth.dto.request.hall;

import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;


public record CreateHallRequest(


        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @NotBlank(message = "Short name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String shortName,

        @NotNull(message = "Gender is required")
        GenderType genderType,

        @Size(max = 15, message = "Bkash number must not exceed 15 characters")
        String bkashNumber,

        @Size(max = 15, message = "Nagad number must not exceed 15 characters")
        String nagadNumber,

        String hallAdminId

) { }
