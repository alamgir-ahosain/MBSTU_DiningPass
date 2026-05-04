package com.mbstu.diningpass.auth.service.abstraction;

import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentResponse;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

public interface StudentService {
    public StudentResponse register(StudentRegistrationRequest request);
    public StudentResponse updateStudent(UUID id, UpdateStudentProfileRequest request);
    public MessageResponse suspendStudent(UUID id, SuspendStudentRequest request);
    public StudentResponse getStudentById(UUID id);
    public List<StudentResponse> getAllStudent();
    public List<StudentResponse> getAllActiveStudent();

}
