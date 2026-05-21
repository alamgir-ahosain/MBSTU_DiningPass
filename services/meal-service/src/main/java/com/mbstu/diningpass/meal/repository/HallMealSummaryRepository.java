package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.HallMealSummary;
import com.mbstu.diningpass.meal.enums.MealType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface HallMealSummaryRepository extends JpaRepository<HallMealSummary, UUID> {

    Optional<HallMealSummary> findByHallShortNameAndMealType(
            String hallShortName, MealType mealType
    );

    boolean existsByHallShortNameAndMealTypeAndIsFinalizedTrue(
            String hallShortName, MealType mealType
    );

    @Modifying
    @Query("""
        UPDATE HallMealSummary s
        SET s.isFinalized = true, s.finalizedAt = :now
        WHERE s.hallShortName = :hallShortName AND s.mealType = :mealType
        """)
    void finalizeForHallAndMealType(
            @Param("hallShortName") String hallShortName,
            @Param("mealType") MealType mealType,
            @Param("now") LocalDateTime now
    );


    default void finalizeForHallAndMealType(String hallShortName, MealType mealType) {
        finalizeForHallAndMealType(hallShortName, mealType, LocalDateTime.now());
    }


    @Query("SELECT p FROM HallMealSummary p WHERE p.hallShortName = :hallShortName")
    Page<HallMealSummary> findByHallShortName(
            @Param("hallShortName") String hallShortName,
            Pageable pageable
    );
}