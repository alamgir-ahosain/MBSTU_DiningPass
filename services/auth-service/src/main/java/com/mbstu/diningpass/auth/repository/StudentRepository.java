package com.mbstu.diningpass.auth.repository;

import com.mbstu.diningpass.auth.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    boolean existsByStudentId(String studentId);
    boolean existsByEmail( String email);
    List<Student> findByHallId(UUID myHallId);
}
