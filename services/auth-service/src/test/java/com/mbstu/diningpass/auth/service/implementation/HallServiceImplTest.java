package com.mbstu.diningpass.auth.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ForbiddenException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallAssociateRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;

@ExtendWith(MockitoExtension.class)
public class HallServiceImplTest {

    @Mock             HallRepository hallRepository;
    @InjectMocks  HallServiceImpl hallService;
    @Mock             HallAssociateRepository hallAssociateRepository;

    private UUID superAdminId;
    private UUID hallAdminId;
    private UUID hallId;
    private Hall hall;
    private CreateHallRequest createHallRequest;

    @BeforeEach
    void init() {
        superAdminId = UUID.randomUUID();
        hallAdminId = UUID.randomUUID();
        hallId = UUID.randomUUID();

        hall = Hall.builder()
                .id(hallId)
                .fullName("Jananeta Abdul Mannan Hall")
                .shortName("JAMH")
                .genderType(GenderType.MALE)
                .bkashNumber("01700000000")
                .nagadNumber("01800000000")
                .hallAdminId(null)
                .isActive(true)
                .build();

        createHallRequest = new CreateHallRequest(
                "Jananeta Abdul Mannan Hall",
                "JAMH",
                GenderType.MALE,
                "01700000000",
                "01800000000",
                null
        );
    }

    // ============================= createHall =============================

    @Test
    @DisplayName("Create Hall: Should create successfully as SUPER_ADMIN")
    void shouldCreateHallSuccessfullyAsSuperAdmin() {

        // GIVEN
        when(hallRepository.existsByFullName(createHallRequest.fullName())).thenReturn(false);
        when(hallRepository.existsByShortName("JAMH")).thenReturn(false);
        when(hallRepository.save(any(Hall.class))).thenReturn(hall);

        // WHEN
        HallResponse response = hallService.createHall(superAdminId, Role.SUPER_ADMIN, createHallRequest);

        // THEN
        assertNotNull(response);
        assertEquals("JAMH", response.shortName());
        assertNull(response.updatedAt());

        // VERIFY
        verify(hallRepository).save(any(Hall.class));
    }

    @Test
    @DisplayName("Create Hall: Non SUPER_ADMIN should throw Forbidden")
    void shouldThrowForbiddenWhenNonSuperAdminCreatesHall() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.createHall(hallAdminId, Role.HALL_ADMIN, createHallRequest));

        // VERIFY
        verifyNoInteractions(hallRepository);
    }

    @Test
    @DisplayName("Create Hall: Duplicate full name should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenFullNameAlreadyExists() {

        // GIVEN
        when(hallRepository.existsByFullName(createHallRequest.fullName())).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallService.createHall(superAdminId, Role.SUPER_ADMIN, createHallRequest));

        // VERIFY
        verify(hallRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create Hall: Duplicate short name should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenShortNameAlreadyExists() {

        // GIVEN
        when(hallRepository.existsByFullName(createHallRequest.fullName())).thenReturn(false);
        when(hallRepository.existsByShortName("JAMH")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallService.createHall(superAdminId, Role.SUPER_ADMIN, createHallRequest));

        // VERIFY
        verify(hallRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create Hall: Should normalize short name to upper case and trimmed")
    void shouldNormalizeShortNameToUpperCaseTrimmed() {

        // GIVEN
        CreateHallRequest lowerCaseRequest = new CreateHallRequest(
                "Some Other Hall", "  jamh2  ", GenderType.FEMALE, "01700000001", null, null
        );
        when(hallRepository.existsByFullName(any())).thenReturn(false);
        when(hallRepository.existsByShortName("JAMH2")).thenReturn(false);
        when(hallRepository.save(any(Hall.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        HallResponse response = hallService.createHall(superAdminId, Role.SUPER_ADMIN, lowerCaseRequest);

        // THEN
        assertEquals("JAMH2", response.shortName());
    }

    // ============================= countHalls =============================

    @Test
    @DisplayName("Count Halls: SUPER_ADMIN should receive the active hall count")
    void shouldReturnCountWhenSuperAdminCountsHalls() {

        // GIVEN
        when(hallRepository.countByIsActiveTrue()).thenReturn(5L);

        // WHEN
        Long count = hallService.countHalls(superAdminId, Role.SUPER_ADMIN);

        // THEN
        assertEquals(5L, count);
    }

    @Test
    @DisplayName("Count Halls: Non SUPER_ADMIN should throw Forbidden")
    void shouldThrowForbiddenWhenNonSuperAdminCountsHalls() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.countHalls(hallAdminId, Role.HALL_ADMIN));
    }

    // ============================= getHallById =============================

    @Test
    @DisplayName("Get Hall By Id: SUPER_ADMIN should receive full response")
    void shouldReturnFullResponseWhenSuperAdminGetsHallById() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        HallResponse response = hallService.getHallById(superAdminId, Role.SUPER_ADMIN, hallId);

        // THEN
        assertEquals(hallId, response.id());

        // VERIFY
        verify(hallAssociateRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Get Hall By Id: HALL_ADMIN should receive response for their own hall")
    void shouldReturnResponseWhenHallAdminGetsOwnHallById() {

        // GIVEN
        HallAssociate requester = HallAssociate.builder().id(hallAdminId).hallId(hallId).role(Role.HALL_ADMIN).build();
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(requester));

        // WHEN
        HallResponse response = hallService.getHallById(hallAdminId, Role.HALL_ADMIN, hallId);

        // THEN
        assertEquals(hallId, response.id());
    }

    @Test
    @DisplayName("Get Hall By Id: HALL_ADMIN requesting another hall should throw Forbidden")
    void shouldThrowForbiddenWhenHallAdminGetsOtherHallById() {

        // GIVEN
        UUID otherHallId = UUID.randomUUID();
        HallAssociate requester = HallAssociate.builder().id(hallAdminId).hallId(otherHallId).role(Role.HALL_ADMIN).build();
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(requester));

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.getHallById(hallAdminId, Role.HALL_ADMIN, hallId));
    }

    @Test
    @DisplayName("Get Hall By Id: Should throw NotFoundException when hall does not exist")
    void shouldThrowResourceNotFoundWhenHallDoesNotExist() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallService.getHallById(superAdminId, Role.SUPER_ADMIN, hallId));
    }

    @Test
    @DisplayName("Get Hall By Id: Invalid role should throw Forbidden")
    void shouldThrowForbiddenForInvalidRoleOnGetHallById() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.getHallById(UUID.randomUUID(), Role.STUDENT, hallId));
    }

    // ============================= getHallByShortName =============================

    @Test
    @DisplayName("Get Hall By Short Name: SUPER_ADMIN should receive the hall")
    void shouldReturnHallWhenSuperAdminGetsByShortName() {

        // GIVEN
        when(hallRepository.findByShortName("JAMH")).thenReturn(Optional.of(hall));

        // WHEN
        HallResponse response = hallService.getHallByShortName(superAdminId, Role.SUPER_ADMIN, "JAMH");

        // THEN
        assertEquals("JAMH", response.shortName());
    }

    @Test
    @DisplayName("Get Hall By Short Name: HALL_ADMIN should receive their own hall")
    void shouldReturnHallWhenHallAdminGetsOwnHallByShortName() {

        // GIVEN
        HallAssociate requester = HallAssociate.builder().id(hallAdminId).hallId(hallId).role(Role.HALL_ADMIN).build();
        when(hallRepository.findByShortNameAndIsActiveTrue("JAMH")).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(requester));

        // WHEN
        HallResponse response = hallService.getHallByShortName(hallAdminId, Role.HALL_ADMIN, "JAMH");

        // THEN
        assertEquals("JAMH", response.shortName());
    }

    @Test
    @DisplayName("Get Hall By Short Name: HALL_ADMIN requesting another hall should throw Forbidden")
    void shouldThrowForbiddenWhenHallAdminGetsOtherHallByShortName() {

        // GIVEN
        HallAssociate requester = HallAssociate.builder().id(hallAdminId).hallId(UUID.randomUUID()).role(Role.HALL_ADMIN).build();
        when(hallRepository.findByShortNameAndIsActiveTrue("JAMH")).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(requester));

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.getHallByShortName(hallAdminId, Role.HALL_ADMIN, "JAMH"));
    }

    // ============================= getAllHalls =============================

    @Test
    @DisplayName("Get All Halls: SUPER_ADMIN with activeOnly should return active halls")
    void shouldReturnActiveHallsWhenSuperAdminRequestsActiveOnly() {

        // GIVEN
        when(hallRepository.findByIsActiveTrue()).thenReturn(List.of(hall));

        // WHEN
        List<HallResponse> result = hallService.getAllHalls(superAdminId, Role.SUPER_ADMIN, true);

        // THEN
        assertEquals(1, result.size());

        // VERIFY
        verify(hallRepository).findByIsActiveTrue();
        verify(hallRepository, never()).findAll();
    }

    @Test
    @DisplayName("Get All Halls: SUPER_ADMIN without activeOnly should return all halls")
    void shouldReturnAllHallsWhenSuperAdminRequestsAll() {

        // GIVEN
        when(hallRepository.findAll()).thenReturn(List.of(hall));

        // WHEN
        List<HallResponse> result = hallService.getAllHalls(superAdminId, Role.SUPER_ADMIN, false);

        // THEN
        assertEquals(1, result.size());

        // VERIFY
        verify(hallRepository).findAll();
    }

    @Test
    @DisplayName("Get All Halls: Non SUPER_ADMIN should throw Forbidden")
    void shouldThrowForbiddenWhenNonSuperAdminGetsAllHalls() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.getAllHalls(hallAdminId, Role.HALL_ADMIN, true));
    }

    // ============================= updateHall =============================

    @Test
    @DisplayName("Update Hall: Should update successfully")
    void shouldUpdateHallSuccessfully() {

        // GIVEN
        CreateHallRequest updateRequest = new CreateHallRequest(
                "New Full Name", "NEWSN", GenderType.MALE, "01700000002", null, null
        );
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallRepository.existsByFullName("New Full Name")).thenReturn(false);
        when(hallRepository.existsByShortName("NEWSN")).thenReturn(false);
        when(hallRepository.save(any(Hall.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        HallResponse response = hallService.updateHall(superAdminId, Role.SUPER_ADMIN, hallId, updateRequest);

        // THEN
        assertEquals("New Full Name", response.fullName());
        assertEquals("NEWSN", response.shortName());
    }

    @Test
    @DisplayName("Update Hall: Non SUPER_ADMIN should throw Forbidden")
    void shouldThrowForbiddenWhenNonSuperAdminUpdatesHall() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.updateHall(hallAdminId, Role.HALL_ADMIN, hallId, createHallRequest));

        // VERIFY
        verifyNoInteractions(hallRepository);
    }

    @Test
    @DisplayName("Update Hall: Should throw NotFoundException when hall does not exist")
    void shouldThrowResourceNotFoundWhenUpdatingUnknownHall() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallService.updateHall(superAdminId, Role.SUPER_ADMIN, hallId, createHallRequest));
    }

    @Test
    @DisplayName("Update Hall: Duplicate full name should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenUpdatingWithDuplicateFullName() {

        // GIVEN
        CreateHallRequest updateRequest = new CreateHallRequest(
                "Different Name", "JAMH", GenderType.MALE, "01700000002", null, null
        );
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallRepository.existsByFullName("Different Name")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallService.updateHall(superAdminId, Role.SUPER_ADMIN, hallId, updateRequest));
    }

    @Test
    @DisplayName("Update Hall: Duplicate short name should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenUpdatingWithDuplicateShortName() {

        // GIVEN
        CreateHallRequest updateRequest = new CreateHallRequest(
                "Jananeta Abdul Mannan Hall", "TAKEN", GenderType.MALE, "01700000002", null, null
        );
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallRepository.existsByShortName("TAKEN")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallService.updateHall(superAdminId, Role.SUPER_ADMIN, hallId, updateRequest));
    }

    @Test
    @DisplayName("Update Hall: Unchanged names should skip duplicate check")
    void shouldSkipDuplicateCheckWhenNamesAreUnchanged() {

        // GIVEN
        // Same fullName/shortName (case-insensitive) as existing hall -> should not trigger duplicate check
        CreateHallRequest sameNameRequest = new CreateHallRequest(
                "jananeta abdul mannan hall", "jamh", GenderType.FEMALE, "01700000009", null, null
        );
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallRepository.save(any(Hall.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        HallResponse response = hallService.updateHall(superAdminId, Role.SUPER_ADMIN, hallId, sameNameRequest);

        // THEN
        assertEquals(GenderType.FEMALE, response.genderType());

        // VERIFY
        verify(hallRepository, never()).existsByFullName(any());
        verify(hallRepository, never()).existsByShortName(any());
    }

    // ============================= updateHallStatus =============================

    @Test
    @DisplayName("Update Hall Status: Active hall should be suspended")
    void shouldSuspendActiveHall() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        hallService.updateHallStatus(superAdminId, Role.SUPER_ADMIN, hallId);

        // THEN
        assertFalse(hall.isActive());

        // VERIFY
        verify(hallRepository).save(hall);
    }

    @Test
    @DisplayName("Update Hall Status: Inactive hall should be activated")
    void shouldActivateInactiveHall() {

        // GIVEN
        hall.setActive(false);
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        hallService.updateHallStatus(superAdminId, Role.SUPER_ADMIN, hallId);

        // THEN
        assertTrue(hall.isActive());

        // VERIFY
        verify(hallRepository).save(hall);
    }

    @Test
    @DisplayName("Update Hall Status: Non SUPER_ADMIN should throw Forbidden")
    void shouldThrowForbiddenWhenNonSuperAdminUpdatesHallStatus() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> hallService.updateHallStatus(hallAdminId, Role.HALL_ADMIN, hallId));

        // VERIFY
        verifyNoInteractions(hallRepository);
    }

    @Test
    @DisplayName("Update Hall Status: Should throw NotFoundException when hall does not exist")
    void shouldThrowResourceNotFoundWhenUpdatingStatusOfUnknownHall() {

        // GIVEN
        when(hallRepository.findById(hallId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallService.updateHallStatus(superAdminId, Role.SUPER_ADMIN, hallId));
    }
}