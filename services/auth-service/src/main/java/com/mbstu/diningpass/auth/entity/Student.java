package com.mbstu.diningpass.auth.entity;


import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    //  Firebase link
    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "student_id", nullable = false,unique = true, length = 20)
    private String studentId; //CE21012

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;



    // login credentials
    @Column(nullable = false, unique = true, length = 150)
    private String email; // university email

//    @Column(nullable = false)
//    private String password;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;          // STUDENT, HALL_ADMIN, COUNTER_STAFF, SUPER_ADMIN

    @Column(name = "hall_id", nullable = false)
    private UUID hallId; // 1 for JAMH, used for HALL_ADMIN, COUNTER_STAFF role checks

    @Column(name = "room_number", length = 15)
    private String roomNumber; // Room number within the hall if residential

    @Column(nullable = false, length = 60)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenderType gender;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true; // Active or Inactive student



    // others
//    @Column(name = "otp_code", length = 6)
//    private String otpCode;
//
//    @Column(name = "otp_expires_at")
//    private LocalDateTime otpExpiresAt;

    @Column(name = "fcm_token", columnDefinition = "TEXT")
    private String fcmToken;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
