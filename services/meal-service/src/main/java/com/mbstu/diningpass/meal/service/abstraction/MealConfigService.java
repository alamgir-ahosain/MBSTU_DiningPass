package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.mealconfig.MealConfigAdminResponse;
import com.mbstu.diningpass.meal.enums.Role;

import java.util.List;
import java.util.UUID;

public interface MealConfigService {

        MealConfigAdminResponse createMealConfig(UUID requesterId, Role role, CreateMealConfigRequest request);
        MealConfigAdminResponse updateMealConfig(UUID requesterId, Role role, UUID configId, UpdateMealConfigRequest request);
        List<MealConfigAdminResponse> getAllMealConfigs(UUID requesterId, Role role);
    }
