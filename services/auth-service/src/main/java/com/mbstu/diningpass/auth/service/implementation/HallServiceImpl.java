package com.mbstu.diningpass.auth.service.implementation;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
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
    private static final Logger logger = LoggerFactory.getLogger(HallServiceImpl.class);


    //Create Hall
    @Override
    public HallResponse createHall(CreateHallRequest request) {

        if (hallRepository.existsByFullName(request.fullName())) {
            throw new DuplicateResourceException("Hall already exists with full name: " + request.fullName());
        }

        String sanitizedShortName = request.shortName().trim().toUpperCase();
        if (hallRepository.existsByShortName(sanitizedShortName)) {
            throw new DuplicateResourceException("Hall already exists with short name: " + request.shortName());
        }


        Hall newHall = Hall.builder()

                .fullName(request.fullName())
                .shortName(request.shortName())
                .genderType(request.genderType())
                .bkashNumber(request.bkashNumber())
                .nagadNumber(request.nagadNumber())
                .hallAdminId(request.hallAdminId())
                .isActive(true)
                .build();

        Hall savedHall = hallRepository.save(newHall);
        logger.info("Hall created successfully: {}", savedHall.getFullName());
        return mapToResponse(savedHall);
    }


    // Get Hall By ID
    @Override
    @Transactional(readOnly = true)
    public HallResponse getHallById(UUID id) {

        Hall hall = hallRepository.findById(id)
//                .filter(Hall::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active hall not found with id: " + id)
                );

        return mapToResponse(hall);
    }



    // Get Hall By Short Name
    @Override
    @Transactional(readOnly = true)
    public HallResponse getHallByShortName(String shortName) {

        Hall hall = hallRepository.findByShortNameAndIsActiveTrue(shortName)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Active hall not found with short name: " + shortName)
                );

        return mapToResponse(hall);
    }



    // Get All Active Hall
    @Override
    @Transactional(readOnly = true)
    public List<HallResponse> getAllActiveHall() {

        return hallRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

   // Get All Hall
    @Override
    @Transactional(readOnly = true)
    public List<HallResponse> getAllHall(){
        return hallRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Update Hall
    @Override
    public HallResponse updateHall(UUID id, CreateHallRequest request) {

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

        return mapToResponse(hallRepository.save(existingHall));
    }


    // Soft Delete Hall
    @Override
    public void deleteHall(UUID id) {

        Hall hall = hallRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + id));
        if (!hall.isActive()) {
            logger.warn("Hall {} is already inactive", id);
            return;
        }

        hall.setActive(false);
        hallRepository.save(hall);
        logger.info("Hall soft-deleted: {}", hall.getFullName());
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