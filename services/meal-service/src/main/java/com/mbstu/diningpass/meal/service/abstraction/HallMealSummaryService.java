package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.response.summary.HallMealSummaryResponse;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.UUID;

public interface HallMealSummaryService {



    void onPaymentApproved(String hallShortName, LocalDate mealDate,
                           MealType mealType, Long amount,
                           String mealMenu, String feastNote);

     void onTokenUsed(String hallShortName, LocalDate mealDate, MealType mealType);
     void onTokenExpired(String hallShortName, LocalDate mealDate, MealType mealType) ;
     Page<HallMealSummaryResponse> getAllHallMealSummary(UUID id, Role requesterRole, int page, int size) ;


    }
