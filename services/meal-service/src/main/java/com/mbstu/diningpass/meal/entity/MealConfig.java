package com.mbstu.diningpass.meal.entity;


import com.mbstu.diningpass.meal.enums.MealType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(
        name = "meal_configs",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_hall_meal_date_type",
                columnNames = {"hall_short_name", "meal_date", "meal_type"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MealConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hall_short_name", nullable = false)
    private String hallShortName; // e.g. JAMH

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate; // when the meal is served

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType; // LUNCH | DINNER

    @Column(name = "meal_menu", length = 255)
    private String mealMenu;       //  "Rice, Dal, Fish Curry, Salad"

    @Column(name = "meal_price", nullable = false)
    private Long mealPrice ; // meal price in tk (30, 60) to avoid floating point issues

    @Builder.Default
    @Column(name = "cut_token_before", nullable = false)
    private LocalTime cutTokenBefore = LocalTime.of(23, 59); //Token cutting deadline

    @Column(name = "token_expires", nullable = false)
    private LocalTime tokenExpires;// QR becomes invalid after this time


    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true; // Active or Inactive meal config

    @Column(name = "feast_note", length = 100)
    private String feastNote; // e.g. "Eid Special"



    // Stored as plain UUIDs — Admin entity lives in auth-service
    @Column(name = "created_by", nullable = false)
    private UUID createdBy; // who created the meal config

    @Column(name = "updated_by", nullable = false)
    private UUID updatedBy; // who updated the meal config

    // Snapshots — avoid Feign calls on every read
    @Column(name = "created_by_name", nullable = false)
    private String createdByName; // who created the meal config

    @Column(name = "updated_by_name", nullable = false)
    private String updatedByName; // who updated the meal config



    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // when the meal config is created

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // when the meal config is updated

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
