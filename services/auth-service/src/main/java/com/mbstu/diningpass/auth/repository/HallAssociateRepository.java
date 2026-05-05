package com.mbstu.diningpass.auth.repository;

import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallAssociateRepository extends JpaRepository<HallAssociate, UUID> {

    boolean existsByEmail(String email);
    boolean existsByHallIdAndRole(UUID hallId, Role role);  // provost uniqueness check
    List<HallAssociate> findByRole(Role role);
    List<HallAssociate> findByHallId(UUID hallId);
}
