package com.mbstu.diningpass.meal.client;

import com.mbstu.diningpass.meal.dto.response.client.HallResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "hall-service", url = "${services.auth-service.url}")
public interface HallFeignClient {

    @GetMapping("/api/v1/halls/{id}")
    HallResponse getHalLById(@PathVariable  UUID id);
}
