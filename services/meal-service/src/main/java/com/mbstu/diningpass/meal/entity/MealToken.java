package com.mbstu.diningpass.meal.entity;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.enums.ScanMode;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "meal_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MealToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;                     // NOT NULL - token only exists with a payment

    @Column(name = "student_id", nullable = false)
    private UUID studentId;                     // plain UUID - students live in auth-service

    @Column(name = "hall_short_name", nullable = false)
    private String hallShortName;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;                  // LUNCH | DINNER

    @Column(name = "meal_price", nullable = false)
    private Long mealPrice;                     // price snapshot — locked at booking time


    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "token_status", nullable = false, length = 30)
    private TokenStatus tokenStatus = TokenStatus.APPROVED;

    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData;                  // signed Firebase token — set after approval

    @Column(name = "qr_generated_at")
    private LocalDateTime qrGeneratedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_mode", length = 20)
    private ScanMode scanMode;                  // nullable - set when scanned

    @Column(name = "scanned_by_id")
    private UUID scannedById;                   // plain UUID - NULL if student self-scan

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
