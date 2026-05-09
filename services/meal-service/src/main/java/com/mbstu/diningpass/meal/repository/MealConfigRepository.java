package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface MealConfigRepository extends JpaRepository<MealConfig, UUID> {

    boolean existsByHallShortNameAndMealDateAndMealType(String hallShortName, LocalDate localDate, MealType mealType);
    Optional<MealConfig> findByIdAndHallShortName(UUID id, String hallShortName);
    List<MealConfig> findByHallShortNameOrderByMealDateDesc(String hallShortName);
    Optional<MealConfig> findByHallShortNameAndMealDateAndMealType(String hallShortName, LocalDate mealDate, MealType mealType);
}