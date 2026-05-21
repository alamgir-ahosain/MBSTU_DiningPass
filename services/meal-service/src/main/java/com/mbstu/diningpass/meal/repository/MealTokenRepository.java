package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MealTokenRepository extends JpaRepository<MealToken, UUID> {

    boolean existsByStudentIdAndMealDateAndMealType(
            UUID studentId,
            LocalDate mealDate,
            MealType mealType
    );

    List<MealToken> findByStudentIdAndTokenStatus(UUID studentId, TokenStatus tokenStatus);




    // Delete after cleanup
    @Modifying
    @Query("DELETE FROM MealToken t WHERE t.mealDate = :date AND t.mealType = :mealType")
    int deleteByMealDateAndMealType(
            @Param("date") LocalDate date,
            @Param("mealType") MealType mealType
    );


    // Find orphaned records older than a given date (safety net for catch-up)
    @Query("""
        SELECT DISTINCT t.mealDate, t.mealType
        FROM MealToken t
        WHERE t.mealDate < :date
        ORDER BY t.mealDate ASC
        """)
    List<Object[]> findDistinctMealDateAndTypeOlderThan(@Param("date") LocalDate date);


    // find distinct halls that have tokens for a given date + meal type
    // used by cleanup to know which halls to finalize
    @Query("SELECT DISTINCT t.hallShortName FROM MealToken t WHERE t.mealDate = :date AND t.mealType = :mealType")
    List<String> findDistinctHallShortNameByMealDateAndMealType(
            @Param("date") LocalDate date,
            @Param("mealType") MealType mealType
    );

    // for no-show detection per hall
    List<MealToken> findByHallShortNameAndMealDateAndMealTypeAndTokenStatus(
            String hallShortName, LocalDate mealDate, MealType mealType, TokenStatus tokenStatus
    );



}
