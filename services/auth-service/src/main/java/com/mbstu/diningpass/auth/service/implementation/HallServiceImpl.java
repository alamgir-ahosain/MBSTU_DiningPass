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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
    // Create Hall — evict all hall caches since list/count are now stale
    @Override
    @Caching(evict = {
            @CacheEvict(value = "halls", key = "'all'"),        // getAllHalls
            @CacheEvict(value = "halls", key = "'all-active'"), //getAllHalls
            @CacheEvict(value = "halls", key = "'count'")       // countHalls
    })
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




    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "halls", key = "'count'")
    public Long countHalls(UUID requesterId, Role role) {
        logger.warn("auth-service/hall: DIRECT DB CALL for countHalls");
        ensureSuperAdmin(role);
        long totalActiveHall = hallRepository.countByIsActiveTrue();
        logger.info("[SUCCESS] Hall count active={}", totalActiveHall);
        return totalActiveHall;
    }


    // Get Hall By ID
    // Get by ID — cache per hallId
    // SUPER_ADMIN gets updatedAt too, so key includes role to avoid serving
    // a HALL_ADMIN the richer SUPER_ADMIN response (or vice versa)
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "halls", key = "'id:' + #hallId + ':' + #role")
    public HallResponse getHallById(UUID requesterId, Role role, UUID hallId) {

        logger.warn("auth-service/hall: DIRECT DB CALL for getHallById");


        Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        // SUPER_ADMIN: retrived any hall by id
        if (role == Role.SUPER_ADMIN) {
            return mapToSuperAdminResponse(hall);
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
    // Get by Short Name — cache per shortName + role
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "halls", key = "'shortName:' + #shortName.toUpperCase() + ':' + #role")
    public HallResponse getHallByShortName(UUID requesterId, Role role, String shortName) {

        logger.warn("auth-service/hall: DIRECT DB CALL for getHallByShortName");

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
   @Cacheable(value = "halls", key = "#activeOnly ? 'all-active' : 'all'")
   public List<HallResponse> getAllHalls(UUID requesterId, Role role, boolean activeOnly) {

       logger.warn("auth-service/hall: DIRECT DB CALL for getAllHalls");

       if (role != Role.SUPER_ADMIN) {
           throw new ForbiddenException("Only SUPER_ADMIN can view all halls");
       }

       // active hall only
       if (activeOnly) {
           return hallRepository.findByIsActiveTrue()
                   .stream()
                   .map(this::mapToResponse).
                   toList();
       }

       // all hall
       return hallRepository.findAll()
               .stream()
               .map(this::mapToResponse)
               .toList();
   }


    // Update Hall — evict everything hall-related
    @Override
    @Caching(evict = {
            @CacheEvict(value = "halls", key = "'all'"),
            @CacheEvict(value = "halls", key = "'all-active'"),
            @CacheEvict(value = "halls", key = "'count'"),
            @CacheEvict(value = "halls", key = "'id:' + #id + ':' + T(com.mbstu.diningpass.auth.enums.Role).SUPER_ADMIN"),
            @CacheEvict(value = "halls", key = "'id:' + #id + ':' + T(com.mbstu.diningpass.auth.enums.Role).HALL_ADMIN"),
            @CacheEvict(value = "halls", key = "'shortName:' + #request.shortName().toUpperCase() + ':' + T(com.mbstu.diningpass.auth.enums.Role).SUPER_ADMIN"),
            @CacheEvict(value = "halls", key = "'shortName:' + #request.shortName().toUpperCase() + ':' + T(com.mbstu.diningpass.auth.enums.Role).HALL_ADMIN")
    })
    public HallResponse updateHall(UUID requesterId, Role role, UUID id, CreateHallRequest request) {

        logger.warn("auth-service/hall: DIRECT DB CALL for updateHall");

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



    // Toggle status — evict all since active/inactive state affects list queries
    @Override
    @Caching(evict = {
            @CacheEvict(value = "halls", key = "'all'"),
            @CacheEvict(value = "halls", key = "'all-active'"),
            @CacheEvict(value = "halls", key = "'count'"),
            @CacheEvict(value = "halls", key = "'id:' + #id + ':' + T(com.mbstu.diningpass.auth.enums.Role).SUPER_ADMIN"),
            @CacheEvict(value = "halls", key = "'id:' + #id + ':' + T(com.mbstu.diningpass.auth.enums.Role).HALL_ADMIN")
    })
    public void updateHallStatus(UUID requesterId, Role role, UUID id) {

        ensureSuperAdmin(role);
        logger.warn("[UPDATE_HALL_STATUS] requester={} hallId={}", requesterId, id);
        Hall hall = hallRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + id));

        if (hall.isActive()) {
            hall.setActive(false);
            logger.info("[SUCCESS] Hall suspended id={} name={}", hall.getId(), hall.getFullName());
        } else {
            hall.setActive(true);
            logger.info("[SUCCESS] Hall activated id={} name={}", hall.getId(), hall.getFullName());
        }

        hallRepository.save(hall);
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
                hall.getCreatedAt(),
                null
        );
    }

    private HallResponse mapToSuperAdminResponse(Hall hall){
        return new HallResponse(
                hall.getId(),
                hall.getFullName(),
                hall.getShortName(),
                hall.getGenderType(),
                hall.getBkashNumber(),
                hall.getNagadNumber(),
                hall.getHallAdminId(),
                hall.isActive(),
                hall.getCreatedAt(),
                hall.getUpdatedAt()
        );
    }
}