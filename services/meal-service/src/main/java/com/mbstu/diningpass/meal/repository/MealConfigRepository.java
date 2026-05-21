package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface MealConfigRepository extends JpaRepository<MealConfig, UUID> {

    boolean existsByHallShortNameAndMealDateAndMealType(String hallShortName, LocalDate localDate, MealType mealType);
    Optional<MealConfig> findByIdAndHallShortName(UUID id, String hallShortName);
    List<MealConfig> findByHallShortNameOrderByMealDateDesc(String hallShortName);
    Optional<MealConfig> findByHallShortNameAndMealDateAndMealType(String hallShortName, LocalDate mealDate, MealType mealType);
    List<MealConfig> findByHallShortNameAndMealDateIn(String hallShortName, List<LocalDate> dates);
    List<MealConfig> findByHallShortNameAndIsActiveTrueOrderByMealDateDesc(String hallShortName);

    // Delete configs for a hall where the meal window has fully passed
    @Modifying
    @Query("""
    DELETE FROM MealConfig c
    WHERE c.hallShortName = :hallShortName
    AND (
        c.mealDate < :today
        OR (c.mealDate = :today AND c.tokenExpires < :now)
    )
    """)
    int deleteExpiredConfigs(
            @Param("hallShortName") String hallShortName,
            @Param("today") LocalDate today,
            @Param("now") LocalTime now
    );

    // Find distinct halls that have expired configs (for scheduler safety net)
    @Query("""
    SELECT DISTINCT c.hallShortName FROM MealConfig c
    WHERE c.mealDate < :today
    OR (c.mealDate = :today AND c.tokenExpires < :now)
    """)
    List<String> findHallsWithExpiredConfigs(
            @Param("today") LocalDate today,
            @Param("now") LocalTime now
    );
}