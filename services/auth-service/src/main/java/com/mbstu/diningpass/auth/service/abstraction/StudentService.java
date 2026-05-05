package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentResponse;
import com.mbstu.diningpass.auth.enums.Role;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

public interface StudentService {

    StudentResponse register(StudentRegistrationRequest request);
    StudentResponse getMyProfile(UUID requesterId, Role role);
    StudentResponse updateMyProfile(UUID requesterId, Role role, UpdateStudentProfileRequest request);
    MessageResponse suspendStudent(UUID requesterId, Role role, UUID targetId, SuspendStudentRequest request);
    List<StudentResponse> getAllStudents(UUID requesterId, Role role, UUID hallId, boolean activeOnly);
}
