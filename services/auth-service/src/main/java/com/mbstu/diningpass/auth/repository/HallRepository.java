package com.mbstu.diningpass.auth.repository;

import com.mbstu.diningpass.auth.entity.Hall;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HallRepository extends JpaRepository<Hall, UUID> {

    boolean existsByFullName(String fullName);
    boolean existsByShortName(String shortName);
    Optional<Hall> findByShortNameAndIsActiveTrue(String shortName);
    List<Hall> findByIsActiveTrue();
    Optional<Hall> findByShortName(String shortName);
}
