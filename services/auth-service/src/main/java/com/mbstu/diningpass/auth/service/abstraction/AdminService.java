package com.mbstu.diningpass.auth.service.abstraction;


import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
import com.mbstu.diningpass.auth.dto.response.admin.AdminResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    public AdminResponse createAdminRequest(CreateAdminRequest request);
    public List<AdminResponse> getAllAdmin();
    public void deleteAdmin(UUID adminId);
}