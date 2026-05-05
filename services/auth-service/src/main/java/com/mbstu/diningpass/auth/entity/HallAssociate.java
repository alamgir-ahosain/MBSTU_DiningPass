package com.mbstu.diningpass.auth.entity;


import com.mbstu.diningpass.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hall_associates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HallAssociate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;



    //login credentials
    @Column(nullable = false, unique = true)
    private String email; // university email

//    @Column(nullable = false)
//    private String password;




    @Column(length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;             // SUPER_ADMIN | HALL_ADMIN | HALL_STAFF

    @Column(name = "hall_id", nullable = false)
    private UUID hallId; // 1 for JAMH // NULL for SUPER_ADMIN

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
