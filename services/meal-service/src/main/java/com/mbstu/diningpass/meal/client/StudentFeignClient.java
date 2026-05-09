package com.mbstu.diningpass.meal.client;

import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.enums.Role;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${services.auth-service.url}")
public interface StudentFeignClient {

    @GetMapping("/api/v1/students/me")
    StudentProfileResponse getProfile();
}


