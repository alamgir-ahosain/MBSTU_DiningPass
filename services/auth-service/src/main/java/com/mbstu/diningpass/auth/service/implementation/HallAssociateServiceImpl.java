package com.mbstu.diningpass.auth.service.implementation;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.hallassociate.UpdateHallAssociateProfileRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateAdminResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateProfileResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.entity.Student;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.BadRequestException;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ForbiddenException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallAssociateRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.service.abstraction.HallAssociateService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HallAssociateServiceImpl implements HallAssociateService {

    private final HallAssociateRepository hallAssociateRepository;
    private final HallRepository hallRepository;
    private static final Logger logger = LoggerFactory.getLogger(HallAssociateServiceImpl.class);




    @Override
    @Transactional
    public HallAssociateAdminResponse create(UUID requesterId, Role requesterRole, HallAssociateRegistrationRequest request) {

        logger.info("[SERVICE_CREATE] requester={} role={} targetRole={}", requesterId, requesterRole, request.role());

        // STEP 1: ROLE VALIDATION
        Role finalRole;

        if (requesterRole == Role.SUPER_ADMIN) {
            finalRole = request.role(); // SUPER ADMIN decides freely
        }

        else if (requesterRole == Role.HALL_ADMIN) {

            if (request.role() != Role.HALL_STAFF) {
                logger.warn("[FORBIDDEN] HALL_ADMIN tried invalid role {}", request.role());
                throw new AccessDeniedException("HALL_ADMIN can only create STAFF");
            }

            finalRole = Role.HALL_STAFF;
        }

        else {
            throw new AccessDeniedException("Not allowed to create accounts");
        }


        // STEP 2: DUPLICATE CHECK
        if (hallAssociateRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists");
        }

        // STEP 3: HALL VALIDATION
        Hall hall=hallRepository.findByShortNameAndIsActiveTrue(request.hallShortName()).orElseThrow(() -> {
            logger.error("Hall not found with short name: {}", request.hallShortName());
            return new ResourceNotFoundException("Hall not found with short name: " + request.hallShortName());
        });



        // Only one HALL_ADMIN per hall
        if (finalRole == Role.HALL_ADMIN && hallAssociateRepository.existsByHallIdAndRole(hall.getId(), Role.HALL_ADMIN)) {
            throw new DuplicateResourceException("Hall already has an admin");
        }

        // STEP 4: FIREBASE USER CREATE
        UserRecord firebaseUser = null;

        String tempPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 12) + "Aa1!";

        try {
            firebaseUser = FirebaseAuth.getInstance().createUser(
                    new UserRecord.CreateRequest()
                            .setEmail(request.email())
                            .setPassword(tempPassword)
                            .setDisplayName(request.fullName())
                            .setEmailVerified(false)
            );

            // STEP 5: SAVE DB ENTITY
            HallAssociate associate = HallAssociate.builder()
                    .fullName(request.fullName())
                    .email(request.email())
                    .phone(request.phone())
                    .role(finalRole)
                    .hallId(hall.getId())
                    .firebaseUid(firebaseUser.getUid())
                    .build();

            HallAssociate saved = hallAssociateRepository.save(associate);

            // STEP 6: FIREBASE CLAIMS
            Map<String, Object> claims = Map.of(
                    "dbId", saved.getId().toString(),
                    "role", saved.getRole().name()
            );

            FirebaseAuth.getInstance().setCustomUserClaims(firebaseUser.getUid(), claims);

            logger.info("[SUCCESS] Created {} with id={}", finalRole, saved.getId());
            return mapToResponseAdmin(saved,hall);

        } catch (Exception e) {

            // rollback Firebase user
            if (firebaseUser != null) {
                try {
                    FirebaseAuth.getInstance().deleteUser(firebaseUser.getUid());
                } catch (Exception ex) {
                    logger.error("Firebase rollback failed: {}", ex.getMessage());
                }
            }

            logger.error("Creation failed: {}", e.getMessage());
            throw new RuntimeException("Creation failed: " + e.getMessage());
        }
    }








    @Override
    @Transactional(readOnly = true)
    public List<HallAssociateAdminResponse> getAccounts(UUID requesterId, Role requesterRole, Role filterRole, UUID hallId) {

        // ================= SUPER ADMIN =================
        if (requesterRole == Role.SUPER_ADMIN) {

            if (filterRole != null) {

                List<HallAssociate> list= hallAssociateRepository.findByRole(filterRole);
                Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

                return list.stream()
                        .map(a -> mapToResponseAdmin(a, hall))
                        .toList();
            }

            if (hallId != null) {

                List<HallAssociate> list = hallAssociateRepository.findByHallId(hallId);
                Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

                return list.stream()
                        .map(a -> mapToResponseAdmin(a, hall))
                        .toList();
            }


            List<HallAssociate> list=hallAssociateRepository.findAll();
            Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
            return list.stream()
                    .map(a -> mapToResponseAdmin(a, hall))
                    .toList();

        }

        // ================= HALL ADMIN =================
        if (requesterRole == Role.HALL_ADMIN) {

            HallAssociate requester = hallAssociateRepository.findById(requesterId).orElseThrow();
            UUID myHall = requester.getHallId();

            if (hallId != null && !hallId.equals(myHall)) {
                throw new AccessDeniedException("Cannot access other halls");
            }

            List<HallAssociate> result = hallAssociateRepository.findByHallId(myHall);

            if (filterRole != null) {
                result = result.stream()
                        .filter(a -> a.getRole() == filterRole)
                        .toList();
            }


            Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
            return result.stream()
                    .map(a -> mapToResponseAdmin(a, hall))
                    .toList();
        }


        throw new AccessDeniedException("Invalid role");
    }






    @Override
    @Transactional(readOnly = true)
    public HallAssociateProfileResponse getMyProfile(UUID requesterId, Role role) {

        HallAssociate target = hallAssociateRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        Hall hall = hallRepository.findById(target.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
        return mapToResponse(target,hall);
    }




    @Override
    public HallAssociateProfileResponse updateMyProfile(UUID requesterId, Role role, UpdateHallAssociateProfileRequest request) {


        HallAssociate associate=hallAssociateRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        Hall hall = hallRepository.findById(associate.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        if(!associate.isActive()){
            logger.warn("Associate {} is inactive", requesterId);
            throw new BadRequestException("Inactive associate cannot be updated");
        }
        associate.setFullName(request.fullName());
        associate.setPhone(request.phone());

        hallAssociateRepository.save(associate);
        logger.info("[PROFILE_UPDATED] student={}", requesterId);
        return mapToResponse(associate,hall);
    }







    @Override
    @Transactional
    public MessageResponse suspend(UUID requesterId, Role role, UUID targetId, SuspendStudentRequest request) {

        HallAssociate target = hallAssociateRepository.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Associate not found"));

        // ================= SUPER ADMIN =================
        if (role == Role.SUPER_ADMIN) {
            return doSuspend(target, request);
        }

        // ================= HALL ADMIN =================
        if (role == Role.HALL_ADMIN) {

            HallAssociate requester = hallAssociateRepository.findById(requesterId).orElseThrow();

            if (!requester.getHallId().equals(target.getHallId())) {throw new AccessDeniedException("Cannot suspend outside your hall");}
            if (target.getRole() == Role.SUPER_ADMIN) {throw new AccessDeniedException("Cannot suspend SUPER_ADMIN");}

            return doSuspend(target, request);
        }


        // ================= STAFF =================
        throw new AccessDeniedException("Not allowed to suspend accounts");
    }



    private MessageResponse doSuspend(HallAssociate associate, SuspendStudentRequest request) {

        if (!associate.isActive()) {return new MessageResponse("Already inactive", false);}

        associate.setActive(false);
        associate.setUpdatedAt(LocalDateTime.now());

        try {FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(associate.getFirebaseUid()).setDisabled(true));}
        catch (FirebaseAuthException e) {logger.warn("Firebase disable failed: {}", e.getMessage());}

        hallAssociateRepository.save(associate);
        return new MessageResponse(associate.getRole() + " suspended successfully", true);
    }






    private HallAssociateAdminResponse mapToResponseAdmin(HallAssociate associate, Hall hall) {

        return new HallAssociateAdminResponse(
                associate.getId(),
                associate.getFullName(),
                associate.getEmail(),
                associate.getPhone(),
                associate.getRole(),
                hall.getShortName(),
                associate.isActive(),
                associate.getCreatedAt(),
                associate.getUpdatedAt()
        );
    }

    private HallAssociateProfileResponse mapToResponse(HallAssociate associate, Hall hall) {

        return new HallAssociateProfileResponse(
                associate.getFullName(),
                associate.getEmail(),
                associate.getPhone(),
                associate.getRole(),
                hall.getShortName(),
                associate.isActive(),
                associate.getCreatedAt(),
                associate.getUpdatedAt()
        );
    }
}