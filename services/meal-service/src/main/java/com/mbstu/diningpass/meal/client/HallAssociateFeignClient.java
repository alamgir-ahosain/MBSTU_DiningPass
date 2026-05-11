package com.mbstu.diningpass.meal.client;

import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.enums.Role;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "hall-associate-service", url = "${services.auth-service.url}")

// To this (Eureka resolves the service by name):
//@FeignClient(name = "auth-service")

public interface HallAssociateFeignClient {



    @GetMapping("/api/v1/admins/me")
    HallAssociateProfileResponse getMyProfile();


}
