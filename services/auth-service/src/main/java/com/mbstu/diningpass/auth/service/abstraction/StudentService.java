package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileAdminResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileResponse;
import com.mbstu.diningpass.auth.enums.Role;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface StudentService {

    StudentProfileResponse register(StudentRegistrationRequest request);
    StudentProfileResponse getMyProfile(UUID requesterId, Role role);
    StudentProfileResponse updateMyProfile(UUID requesterId, Role role, UpdateStudentProfileRequest request);
    MessageResponse suspendStudent(UUID requesterId, Role role, UUID targetId);
    Page<StudentProfileAdminResponse> getAllStudents(UUID requesterId, Role role, UUID hallId, int page, int size) ;

    }
