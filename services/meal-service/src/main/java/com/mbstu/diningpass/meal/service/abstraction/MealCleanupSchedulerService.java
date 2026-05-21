package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.enums.MealType;

import java.time.LocalDate;

public interface MealCleanupSchedulerService {

     void cleanupLunch();
     void cleanupDinner() ;
     void cleanupIfNotDone(LocalDate date, MealType mealType) ;
     void cleanupAnythingOlderThan(LocalDate date) ;





    }
