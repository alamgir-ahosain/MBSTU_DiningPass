package com.mbstu.diningpass.auth.entity;

import com.mbstu.diningpass.auth.enums.GenderType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "halls")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "full_name", nullable = false, unique = true, length = 200)
    private String fullName; // Jananeta Abdul Mannan Hall

    @Column(name = "short_name", nullable = false, unique = true, length = 100)
    private String shortName; // JAMH

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_type", nullable = false)
    private GenderType genderType;          // MALE | FEMALE

    @Column(name = "bkash_number", nullable = false, length = 20)
    private String bkashNumber;

    @Column(name = "nagad_number", length = 20)
    private String nagadNumber;

    @Column(name = "provost_id", length = 100)
    private String hallAdminId; // Hall provost

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now();}

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

}
