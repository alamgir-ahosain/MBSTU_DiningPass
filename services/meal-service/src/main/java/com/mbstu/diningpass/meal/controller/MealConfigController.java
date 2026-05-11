package com.mbstu.diningpass.meal.controller;


import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.mealconfig.MealConfigAdminResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.MealConfigService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meal-configs")
@AllArgsConstructor
public class MealConfigController {

    private static final Logger logger= LoggerFactory.getLogger(MealConfigController.class);

    private final MealConfigService mealConfigService;


    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Meal-Service: Meal Config Controller is working!");
        return ResponseEntity.ok("Meal-Service: Meal Config Controller is working!");
    }

    /*
      Create Meal Config
     */
    @PostMapping
    public ResponseEntity<MealConfigAdminResponse> createMealConfig(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @Valid @RequestBody CreateMealConfigRequest request){

        Role role= Role.valueOf(requesterRoleStr);
        logger.info("[CREATE_MEAL_CONFIG] requester={} role={}", requesterId, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(mealConfigService.createMealConfig(requesterId, role, request));
    }


    /*
        Get All Meal Configs
       */

    @GetMapping
    public ResponseEntity<List<MealConfigAdminResponse>> getAllMealConfigs(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr) {

        Role role= Role.valueOf(requesterRoleStr);
        logger.info("[GET_ALL_MEAL_CONFIGS] requester={} role={}", requesterId, role);
        return ResponseEntity.status(HttpStatus.OK).body( mealConfigService.getAllMealConfigs(requesterId, role));
    }

    /*
      Update Meal Config
     */
    @PutMapping("/{configId}")
    public ResponseEntity<MealConfigAdminResponse> updateMealConfig(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID configId,
            @Valid @RequestBody UpdateMealConfigRequest request){

        Role role= Role.valueOf(requesterRoleStr);
        logger.info("[UPDATE_MEAL_CONFIG] requester={} role={}", requesterId, role);
        return ResponseEntity.status(HttpStatus.OK).body(mealConfigService.updateMealConfig(requesterId, role,configId, request));
    }


}
