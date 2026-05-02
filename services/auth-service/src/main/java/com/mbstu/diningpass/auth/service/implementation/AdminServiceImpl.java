package com.mbstu.diningpass.auth.service.implementation;

import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
import com.mbstu.diningpass.auth.dto.response.admin.AdminResponse;
import com.mbstu.diningpass.auth.entity.Admin;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.AdminRepository;
import com.mbstu.diningpass.auth.service.abstraction.AdminService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    public final AdminRepository adminRepository;
    public static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);



    @Override
    public AdminResponse createAdminRequest(CreateAdminRequest request){
        if (adminRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("HallAdmin already exists with email: " + request.email());
        }
        Admin newHallAdmin=Admin.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(request.password())
                .phone(request.phone())
                .role(request.role())
                .hallId(request.hallId())
                .build();

        Admin savedHallAdmin=adminRepository.save(newHallAdmin);
        logger.info("Admin created successfully: {}", savedHallAdmin.getFullName());
        return mapToResponse(savedHallAdmin);
    }


    @Override
    @Transactional(readOnly = true)
    public List<AdminResponse> getAllAdmin(){
        return  adminRepository.findAll()
                .stream()
                .map(AdminServiceImpl::mapToResponse)
                .toList();
    }

    @Override
    public void deleteAdmin(UUID id){

        Admin admin=adminRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Admin not found with id: "+id));
        if (!admin.isActive()){
            logger.warn("Admin {} is already inactive", id);
            return;
        }
        admin.setActive(false);
        adminRepository.save(admin);
        logger.info("Admin soft-deleted: {}", admin.getFullName());
    }





    public static AdminResponse mapToResponse(Admin admin) {
        return new AdminResponse(
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                null, // Password is not exposed in the response
                admin.getPhone(),
                admin.getRole(),
                admin.getHallId(),
                admin.isActive(),
                admin.getCreatedAt(),
                admin.getUpdatedAt()
        );
    }

}
