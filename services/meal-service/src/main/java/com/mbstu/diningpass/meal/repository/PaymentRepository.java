package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {


    Optional<Payment> findByBkashPaymentId(String bkashPaymentId);

//    // For admin history view — filter by paymentMethod
//    Page<Payment> findByHallShortNameAndStatusAndPaymentMethod(
//            String hallShortName,
//            PaymentStatus status,
//            PaymentMethod paymentMethod,
//            Pageable pageable
//    );

    @Query("""
        SELECT COUNT(p) > 0
        FROM Payment p
        JOIN p.mealTypes mt
        WHERE p.studentId = :studentId
        AND p.mealDate = :mealDate
        AND mt = :mealType
        AND p.paymentStatus IN :statuses
    """)


    boolean existsMealRequest(
            UUID studentId,
            LocalDate mealDate,
            MealType mealType,
            List<PaymentStatus> statuses
    );

//
//    @Query("SELECT p FROM Payment p WHERE p.hallShortName = :hallShortName AND p.paymentStatus = :status ORDER BY p.submittedAt ASC")
//    Page<Payment> findByHallShortNameAndStatus(
//            @Param("hallShortName") String hallShortName,
//            @Param("status") PaymentStatus status,
//            Pageable pageable
//    );

//    List<Payment> findByStudentId(UUID studentId);


    // Find a single rejected payment for a specific student + date + mealType
//    @Query("""
//    SELECT p FROM Payment p
//    JOIN p.mealTypes mt
//    WHERE p.studentId = :studentId
//    AND p.mealDate = :mealDate
//    AND mt = :mealType
//    AND p.paymentStatus = :status
//    """)
//    Optional<Payment> findRejectedPayment(
//            @Param("studentId") UUID studentId,
//            @Param("mealDate") LocalDate mealDate,
//            @Param("mealType") MealType mealType,
//            @Param("status") PaymentStatus status
//    );


    @Modifying
    @Query("DELETE FROM Payment p WHERE p.mealDate = :date")
    int deleteByMealDate(@Param("date") LocalDate date);
}
