package com.mbstu.diningpass.auth.service.implementation;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.admin.AdminResponse;
import com.mbstu.diningpass.auth.entity.Admin;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.BadRequestException;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.AdminRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.service.abstraction.AdminService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    public final AdminRepository adminRepository;
    public final HallRepository hallRepository;
    public static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);





    @Transactional
    @Override
    public AdminResponse createAdmin(CreateAdminRequest request) {

        //  Step 0: Validation

        if (adminRepository.existsByEmail(request.email())) {
            logger.warn("Admin with email {} already exists", request.email());
            throw new DuplicateResourceException("Admin with email already exists");
        }

        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> {
                    logger.error("Hall with ID {} not found", request.hallId());
                    return new ResourceNotFoundException("Hall not found with ID: " + request.hallId());
                });

        if (!hall.isActive()) {
            logger.error("Hall {} is inactive", request.hallId());
            throw new BadRequestException("Hall is inactive");
        }



        UserRecord firebaseUser = null;
        // Generate a temporary password — admin will reset it via the email Firebase sends
        String tempPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 12) + "Aa1!";

        try {
            //  Step 1: Create Firebase user FIRST
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.email())
                    .setPassword(tempPassword)
                    .setDisplayName(request.fullName())
                    .setEmailVerified(false);

            firebaseUser = FirebaseAuth.getInstance().createUser(createRequest);
            logger.info("Firebase user created: {}", firebaseUser.getUid());

            //  Step 2: Save student in DB with REAL firebase UID
            Admin admin = Admin.builder()
                    .fullName(request.fullName())
                    .email(request.email())
                    .phone(request.phone())
                    .role(Role.HALL_ADMIN)
                    .hallId(request.hallId())
                    .firebaseUid(firebaseUser.getUid())
                    .build();

            Admin savedAdmin = adminRepository.save(admin);
            logger.info("Admin saved in DB: {}", savedAdmin.getId());

            //  Step 3: Set Firebase custom claims AFTER DB success
            Map<String, Object> claims = Map.of(
                    "dbId", savedAdmin.getId().toString(),
                    "role", savedAdmin.getRole().name()
            );

            FirebaseAuth.getInstance().setCustomUserClaims(firebaseUser.getUid(), claims);
            logger.info("Custom claims set for Firebase user: {}", firebaseUser.getUid());

            return mapToResponse(savedAdmin);

        } catch (Exception e) {

            //  COMPENSATION: If anything fails, delete Firebase user
            if (firebaseUser != null) {
                try {
                    FirebaseAuth.getInstance().deleteUser(firebaseUser.getUid());
                    logger.warn("Rolled back Firebase user: {}", firebaseUser.getUid());
                } catch (FirebaseAuthException ex) {
                    logger.error("Failed to rollback Firebase user: {}", ex.getMessage());
                }
            }

            logger.error("Registration failed: {}", e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
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
    public MessageResponse deleteAdmin(UUID id, SuspendStudentRequest request){

        Admin admin=adminRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Admin not found with id: "+id));
        if (!admin.isActive()){
            logger.warn("Admin {} is already inactive", id);
            return new MessageResponse("Admin is already inactive",false);
        }
        admin.setActive(false);
        admin.setUpdatedAt(LocalDateTime.now());

        // Also disable the Firebase account so all tokens are immediately invalidated
        // (Firebase tokens expire in 1 hour, but disabling blocks them right away)
        try {
            FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(admin.getFirebaseUid()).setDisabled(true));
        } catch (FirebaseAuthException e) {
            logger.warn("Could not disable Firebase account for student {}: {}", id, e.getMessage());
        }

        adminRepository.save(admin);
        logger.info("Admin suspended: {}, reason: {}", admin.getFullName(), request.reason());
        return new MessageResponse("Admin soft-deleted successfully",true);
    }





    public static AdminResponse mapToResponse(Admin admin) {
        return new AdminResponse(
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhone(),
                admin.getRole(),
                admin.getHallId(),
                admin.isActive(),
                admin.getCreatedAt(),
                admin.getUpdatedAt()
        );
    }

}
