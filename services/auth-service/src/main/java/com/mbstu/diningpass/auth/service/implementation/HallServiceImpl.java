package com.mbstu.diningpass.auth.service.implementation;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ForbiddenException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallAssociateRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.service.abstraction.HallService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class HallServiceImpl implements HallService {

    private final HallRepository hallRepository;
    private final HallAssociateRepository hallAssociateRepository;
    private static final Logger logger = LoggerFactory.getLogger(HallServiceImpl.class);



    private void ensureSuperAdmin(Role role) {
        if (role != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN allowed");
        }
    }



    //Create Hall
    @Override
    public HallResponse createHall(UUID requesterId, Role role, CreateHallRequest request) {

        ensureSuperAdmin(role);
        logger.info("[CREATE_HALL] requester={} role={} hall={}", requesterId, role, request.shortName());


        // Duplicate check - Full Name
        if (hallRepository.existsByFullName(request.fullName())) {
            throw new DuplicateResourceException("Hall already exists with full name: " + request.fullName());
        }

        // Normalize Short Name (Trim + UpperCase)
        String normalizeShortName = request.shortName().trim().toUpperCase();
        if (hallRepository.existsByShortName(normalizeShortName)) {
            throw new DuplicateResourceException("Hall already exists with short name: " + request.shortName());
        }


        Hall newHall = Hall.builder()

                .fullName(request.fullName())
                .shortName(normalizeShortName)
                .genderType(request.genderType())
                .bkashNumber(request.bkashNumber())
                .nagadNumber(request.nagadNumber())
                .hallAdminId(request.hallAdminId())
                .isActive(true)
                .build();

        Hall savedHall = hallRepository.save(newHall);
        logger.info("[SUCCESS] Hall created id={} name={}", savedHall.getId(), savedHall.getFullName());

        return mapToResponse(savedHall);
    }






    // Get Hall By ID
    @Override
    @Transactional(readOnly = true)
    public HallResponse getHallById(UUID requesterId, Role role, UUID hallId) {

        Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        // SUPER_ADMIN: retrived any hall by id
        if (role == Role.SUPER_ADMIN) {
            return mapToResponse(hall);
        }

        // HALL_ADMIN: retrives only own hall
        if (role == Role.HALL_ADMIN) {

            HallAssociate requester = hallAssociateRepository.findById(requesterId) .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

            if (!requester.getHallId().equals(hallId)) {
                throw new ForbiddenException("You can only access your own hall");
            }

            return mapToResponse(hall);
        }

        throw new ForbiddenException("Not allowed");
    }



    // Get Hall By Short Name
    @Override
    @Transactional(readOnly = true)
    public HallResponse getHallByShortName(UUID requesterId, Role role, String shortName) {

        if (role == Role.SUPER_ADMIN) {
            // Can see all halls, active or not
            Hall hall = hallRepository.findByShortName(shortName).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
            return mapToResponse(hall);
        }

        if (role == Role.HALL_ADMIN) {
            Hall hall = hallRepository.findByShortNameAndIsActiveTrue(shortName).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
            HallAssociate requester = hallAssociateRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Requester not found")); // ← fixed message too
            if (!requester.getHallId().equals(hall.getId())) {
                throw new ForbiddenException("You can only access your own hall");
            }
            return mapToResponse(hall);
        }

        throw new ForbiddenException("Not allowed");
    }





   // Get All Hall
   @Override
   @Transactional(readOnly = true)
   public List<HallResponse> getAllHalls(UUID requesterId, Role role, boolean activeOnly) {

       if (role != Role.SUPER_ADMIN) {
           throw new ForbiddenException("Only SUPER_ADMIN can view all halls");
       }

       //active hall only
       if (activeOnly) {
           return hallRepository.findByIsActiveTrue()
                   .stream()
                   .map(this::mapToResponse).
                   toList();
       }

       //all hall
       return hallRepository.findAll()
               .stream()
               .map(this::mapToResponse)
               .toList();
   }



    // Update Hall
    @Override
    public HallResponse updateHall(UUID requesterId, Role role, UUID id, CreateHallRequest request) {

        ensureSuperAdmin(role);
        logger.info("[UPDATE_HALL] requester={} hallId={}", requesterId, id);

        // 1. Fetch WITHOUT the active filter
        Hall existingHall = hallRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + id));

        // 2. Duplicate Check (Full Name)
        if (!existingHall.getFullName().equalsIgnoreCase(request.fullName()) && hallRepository.existsByFullName(request.fullName())) {
            throw new DuplicateResourceException("Hall name already in use: " + request.fullName());
        }

        // 3. Duplicate Check (Short Name)
        if (!existingHall.getShortName().equalsIgnoreCase(request.shortName()) && hallRepository.existsByShortName(request.shortName())) {
            throw new DuplicateResourceException("Short name already in use: " + request.shortName());
        }

        // 4. Update fields
        existingHall.setFullName(request.fullName());
        existingHall.setShortName(request.shortName().toUpperCase()); // Convention: ShortNames are usually caps
        existingHall.setGenderType(request.genderType());
        existingHall.setBkashNumber(request.bkashNumber());
        existingHall.setNagadNumber(request.nagadNumber());
        existingHall.setHallAdminId(request.hallAdminId());

        Hall updated= hallRepository.save(existingHall);
        logger.info("[SUCCESS] Hall updated id={}", updated.getId());

        return mapToResponse(updated);
    }



    // Soft Delete Hall
    @Override
    public void suspendHall(UUID requesterId, Role role, UUID id) {

        ensureSuperAdmin(role);
        logger.warn("[SUSPEND_HALL] requester={} hallId={}", requesterId, id);

        Hall hall = hallRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + id));
        if (!hall.isActive()) {
            logger.warn("Hall {} is already inactive", id);
            return;
        }

        hall.setActive(false);
        hallRepository.save(hall);
        logger.info("[SUCCESS] Hall suspended id={} name={}", hall.getId(), hall.getFullName());
    }


    // Mapper
    private HallResponse mapToResponse(Hall hall) {
        return new HallResponse(
                hall.getId(),
                hall.getFullName(),
                hall.getShortName(),
                hall.getGenderType(),
                hall.getBkashNumber(),
                hall.getNagadNumber(),
                hall.getHallAdminId(),
                hall.isActive(),
                hall.getCreatedAt()
        );
    }
}