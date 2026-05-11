package com.mbstu.diningpass.auth.dto.request.hallassociate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateHallAssociateProfileRequest(

        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @Size(max = 15, message = "phone number must not exceed 15 characters")
        String phone
) {
}
