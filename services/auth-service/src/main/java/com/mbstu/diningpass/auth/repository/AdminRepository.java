package com.mbstu.diningpass.auth.repository;

import com.mbstu.diningpass.auth.entity.Admin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    boolean existsByEmail(String email);
}
