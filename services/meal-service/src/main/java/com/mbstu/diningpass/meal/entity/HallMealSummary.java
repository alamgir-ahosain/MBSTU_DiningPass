package com.mbstu.diningpass.meal.entity;

import com.mbstu.diningpass.meal.enums.MealType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "hall_meal_summaries",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"hall_short_name", "meal_type"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallMealSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hall_short_name", nullable = false, length = 100)
    private String hallShortName;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(name = "meal_menu", length = 255)
    private String mealMenu;                  // snapshot from MealConfig

    @Column(name = "meal_price")
    private Long mealPrice;                   // snapshot from MealConfig

    @Column(name = "feast_note", length = 100)
    private String feastNote;                 // snapshot from MealConfig

    @Column(name = "total_tokens_sold", nullable = false)
    @Builder.Default
    private Long totalTokensSold = 0L;        // incremented on token cut

    @Column(name = "total_tokens_used", nullable = false)
    @Builder.Default
    private Long totalTokensUsed = 0L;        // incremented on QR scan

    @Column(name = "total_tokens_unused", nullable = false)
    @Builder.Default
    private Long totalTokensUnused = 0L;      // incremented on expiry

    @Column(name = "total_revenue", nullable = false)
    @Builder.Default
    private Long totalRevenue = 0L;           // incremented on payment approval

    @Column(name = "is_finalized", nullable = false)
    @Builder.Default
    private boolean isFinalized = false;      // true after cleanup runs

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}