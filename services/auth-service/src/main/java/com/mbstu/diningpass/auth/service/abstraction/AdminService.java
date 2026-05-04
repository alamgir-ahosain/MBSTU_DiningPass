package com.mbstu.diningpass.auth.service.abstraction;


import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.admin.AdminResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    AdminResponse createAdmin(CreateAdminRequest request);
    List<AdminResponse> getAllAdmin();
    MessageResponse deleteAdmin(UUID id, SuspendStudentRequest request);
}