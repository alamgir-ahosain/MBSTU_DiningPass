package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface MealTokenRepository extends JpaRepository<MealToken, UUID> {

    boolean existsByStudentIdAndMealDateAndMealType(
            UUID studentId,
            LocalDate mealDate,
            MealType mealType
    );

}
