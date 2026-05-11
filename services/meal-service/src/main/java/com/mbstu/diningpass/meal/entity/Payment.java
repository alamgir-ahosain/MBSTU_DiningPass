package com.mbstu.diningpass.meal.entity;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;                     // plain UUID — students live in auth-service

    @Column(name = "hall_short_name", nullable = false)
    private String hallShortName;
    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;                 // which meal date this payment covers

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "payment_meal_types",
            joinColumns = @JoinColumn(name = "payment_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private List<MealType> mealTypes;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;// sum of all linked token prices


    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;        // BKASH | NAGAD | ROCKET | CASH

    @Column(name = "sender_number", nullable = false, length = 20)
    private String senderNumber;                // student's bKash/Nagad number


    @Column(name = "screenshot_url", columnDefinition = "TEXT")
    private String screenshotUrl;               // main proof image URL

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.SUBMITTED; //  SUBMITTED,VERIFIED,REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;             // nullable — set on rejection

    @Column(name = "verified_by_name", length = 100)
    private String verifiedByName;              // snapshot at verification time

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    public void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }

}
