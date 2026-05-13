package com.mbstu.diningpass.auth.repository;

import com.mbstu.diningpass.auth.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    boolean existsByStudentId(String studentId);
    boolean existsByEmail( String email);
    List<Student> findByHallId(UUID myHallId);


    @Query("SELECT s FROM Student s WHERE s.hallId = :hallId ORDER BY s.createdAt DESC")
    Page<Student> findByHallId(
            @Param("hallId") UUID hallId,
            Pageable pageable
    );
}
