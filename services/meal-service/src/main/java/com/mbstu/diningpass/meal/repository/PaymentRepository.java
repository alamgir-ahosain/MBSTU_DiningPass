package com.mbstu.diningpass.meal.repository;

import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

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


    @Query("SELECT p FROM Payment p WHERE p.hallShortName = :hallShortName AND p.paymentStatus = :status ORDER BY p.submittedAt ASC")
    Page<Payment> findByHallShortNameAndStatus(
            @Param("hallShortName") String hallShortName,
            @Param("status") PaymentStatus status,
            Pageable pageable
    );
}
