package com.mbstu.diningpass.auth.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.google.firebase.auth.FirebaseAuth;
import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.hallassociate.UpdateHallAssociateProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateAdminResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateProfileResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.BadRequestException;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallAssociateRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;

// NOTE: static mocking of FirebaseAuth requires the "mockito-inline" (or Mockito 5+
// default inline mock maker) artifact on the test classpath.

@ExtendWith(MockitoExtension.class)
public class HallAssociateServiceImplTest {

    @Mock             HallAssociateRepository hallAssociateRepository;
    @InjectMocks  HallAssociateServiceImpl hallAssociateService;
    @Mock             HallRepository hallRepository;

    private UUID superAdminId;
    private UUID hallAdminId;
    private UUID hallId;
    private Hall hall;
    private HallAssociate hallAdmin;
    private HallAssociate hallStaff;

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
                .isActive(true)
                .build();

        hallAdmin = HallAssociate.builder()
                .id(hallAdminId)
                .fullName("JAMH Hall Provost")
                .email("provost.jamh@gmail.com")
                .role(Role.HALL_ADMIN)
                .hallId(hallId)
                .firebaseUid("firebase-uid-admin")
                .isActive(true)
                .build();

        hallStaff = HallAssociate.builder()
                .id(UUID.randomUUID())
                .fullName("Staff1 JAMH")
                .email("staff1.jamh@gmail.com")
                .role(Role.HALL_STAFF)
                .hallId(hallId)
                .firebaseUid("firebase-uid-staff")
                .isActive(true)
                .build();
    }

    // ============================= create =============================
    // NOTE: create() calls FirebaseAuth.getInstance() statically, which cannot be
    // mocked here without a static-mocking library (e.g., Mockito-inline / mockito-static).
    // These tests cover the branches that fail BEFORE any Firebase call is made.

    @Test
    @DisplayName("Create Account: Should throw AccessDenied when HALL_ADMIN tries to create a non-staff role")
    void shouldThrowAccessDeniedWhenHallAdminTriesToCreateNonStaffRole() {

        // GIVEN
        HallAssociateRegistrationRequest request = new HallAssociateRegistrationRequest("New Admin", "newadmin@mbstu.ac.bd", "password1", "017000000", Role.HALL_ADMIN, "JAMH");

        // WHEN & THEN
        assertThrows(AccessDeniedException.class, () -> hallAssociateService.create(hallAdminId, Role.HALL_ADMIN, request));

        // VERIFY
        verifyNoInteractions(hallRepository);
    }

    @Test
    @DisplayName("Create Account: Should throw AccessDenied for an invalid requester role")
    void shouldThrowAccessDeniedForInvalidRequesterRole() {

        // GIVEN
        HallAssociateRegistrationRequest request = new HallAssociateRegistrationRequest(
                "New Staff", "newstaff@mbstu.ac.bd", "password1", "017000000", Role.HALL_STAFF, "JAMH");

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.create(UUID.randomUUID(), Role.HALL_STAFF, request));
    }

    @Test
    @DisplayName("Create Account: Should throw DuplicateResourceException when email already exists")
    void shouldThrowDuplicateResourceExceptionWhenEmailAlreadyExists() {

        // GIVEN
        HallAssociateRegistrationRequest request = new HallAssociateRegistrationRequest(
                "New Staff", "newstaff@mbstu.ac.bd", "password1", "017000000",
                Role.HALL_STAFF, "JAMH"
        );

        when(hallAssociateRepository.existsByEmail("newstaff@mbstu.ac.bd")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallAssociateService.create(hallAdminId, Role.HALL_ADMIN, request));

        // VERIFY
        verify(hallRepository, never()).findByShortNameAndIsActiveTrue(any());
    }

    @Test
    @DisplayName("Create Account: Should throw NotFoundException when hall does not exist")
    void shouldThrowNotFoundExceptionWhenHallDoesNotExist() {

        // GIVEN
        HallAssociateRegistrationRequest request = new HallAssociateRegistrationRequest(
                "New Staff", "newstaff@mbstu.ac.bd", "password1", "017000000",
                Role.HALL_STAFF, "UNKNOWN"
        );

        when(hallAssociateRepository.existsByEmail("newstaff@mbstu.ac.bd")).thenReturn(false);
        when(hallRepository.findByShortNameAndIsActiveTrue("UNKNOWN")).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallAssociateService.create(hallAdminId, Role.HALL_ADMIN, request));
    }

    @Test
    @DisplayName("Create Account: Should throw DuplicateResourceException when hall already has a provost")
    void shouldThrowDuplicateResourceExceptionWhenHallAlreadyHasAdmin() {

        // GIVEN
        HallAssociateRegistrationRequest request = new HallAssociateRegistrationRequest(
                "New Admin", "newadmin@mbstu.ac.bd", "password1", "017000000",
                Role.HALL_ADMIN, "JAMH"
        );

        when(hallAssociateRepository.existsByEmail("newadmin@mbstu.ac.bd")).thenReturn(false);
        when(hallRepository.findByShortNameAndIsActiveTrue("JAMH")).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.existsByHallIdAndRole(hallId, Role.HALL_ADMIN)).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> hallAssociateService.create(superAdminId, Role.SUPER_ADMIN, request));
    }

    // ============================= getAccounts =============================

    @Test
    @DisplayName("Get Accounts: SUPER_ADMIN with no filters should return all accounts")
    void shouldReturnAllAccountsWhenSuperAdminHasNoFilters() {

        // GIVEN
        when(hallAssociateRepository.findAll()).thenReturn(List.of(hallAdmin, hallStaff));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        List<HallAssociateAdminResponse> result =
                hallAssociateService.getAccounts(superAdminId, Role.SUPER_ADMIN, null, null);

        // THEN
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get Accounts: SUPER_ADMIN with hallId filter should use findByHallId")
    void shouldUseFindByHallIdWhenSuperAdminFiltersByHall() {

        // GIVEN
        when(hallAssociateRepository.findByHallId(hallId)).thenReturn(List.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        List<HallAssociateAdminResponse> result =
                hallAssociateService.getAccounts(superAdminId, Role.SUPER_ADMIN, null, hallId);

        // THEN
        assertEquals(1, result.size());

        // VERIFY
        verify(hallAssociateRepository, never()).findAll();
    }

    @Test
    @DisplayName("Get Accounts: SUPER_ADMIN with role filter should filter results")
    void shouldFilterResultsWhenSuperAdminFiltersByRole() {

        // GIVEN
        when(hallAssociateRepository.findAll()).thenReturn(List.of(hallAdmin, hallStaff));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        List<HallAssociateAdminResponse> result =
                hallAssociateService.getAccounts(superAdminId, Role.SUPER_ADMIN, Role.HALL_STAFF, null);

        // THEN
        assertEquals(1, result.size());
        assertEquals(Role.HALL_STAFF, result.get(0).role());
    }

    @Test
    @DisplayName("Get Accounts: HALL_ADMIN should return accounts for their own hall")
    void shouldReturnAccountsWhenHallAdminRequestsOwnHall() {

        // GIVEN
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallAssociateRepository.findByHallId(hallId)).thenReturn(List.of(hallAdmin, hallStaff));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        List<HallAssociateAdminResponse> result =
                hallAssociateService.getAccounts(hallAdminId, Role.HALL_ADMIN, null, null);

        // THEN
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get Accounts: HALL_ADMIN requesting another hall should throw AccessDenied")
    void shouldThrowAccessDeniedWhenHallAdminRequestsOtherHall() {

        // GIVEN
        UUID otherHallId = UUID.randomUUID();
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.getAccounts(hallAdminId, Role.HALL_ADMIN, null, otherHallId));
    }

    @Test
    @DisplayName("Get Accounts: Invalid requester role should throw AccessDenied")
    void shouldThrowAccessDeniedForInvalidRoleOnGetAccounts() {

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.getAccounts(UUID.randomUUID(), Role.STUDENT, null, null));
    }

    // ============================= getMyProfile =============================

    @Test
    @DisplayName("Get My Profile: Should return profile successfully")
    void shouldReturnMyProfileSuccessfully() {

        // GIVEN
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        HallAssociateProfileResponse response = hallAssociateService.getMyProfile(hallAdminId, Role.HALL_ADMIN);

        // THEN
        assertEquals(hallAdmin.getFullName(), response.fullName());
        assertEquals("JAMH", response.hallShortName());
    }

    @Test
    @DisplayName("Get My Profile: STUDENT role should throw AccessDenied")
    void shouldThrowAccessDeniedWhenStudentRequestsMyProfile() {

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.getMyProfile(UUID.randomUUID(), Role.STUDENT));
    }

    @Test
    @DisplayName("Get My Profile: Should throw NotFoundException when associate does not exist")
    void shouldThrowNotFoundExceptionWhenAssociateDoesNotExist() {

        // GIVEN
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallAssociateService.getMyProfile(hallAdminId, Role.HALL_ADMIN));
    }

    // ============================= getById =============================

    @Test
    @DisplayName("Get By Id: SUPER_ADMIN should receive admin response")
    void shouldReturnAdminResponseWhenSuperAdminGetsById() {

        // GIVEN
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        HallAssociateAdminResponse response = hallAssociateService.getById(superAdminId, Role.SUPER_ADMIN, hallAdminId);

        // THEN
        assertEquals(hallAdminId, response.id());
    }

    @Test
    @DisplayName("Get By Id: Non SUPER_ADMIN should throw AccessDenied")
    void shouldThrowAccessDeniedWhenNonSuperAdminGetsById() {

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.getById(hallAdminId, Role.HALL_ADMIN, hallAdminId));
    }

    // ============================= updateMyProfile =============================

    @Test
    @DisplayName("Update My Profile: Should update successfully")
    void shouldUpdateMyProfileSuccessfully() {

        // GIVEN
        UpdateHallAssociateProfileRequest request = new UpdateHallAssociateProfileRequest("Updated Name", "0199999999");

        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(hallAssociateRepository.save(any(HallAssociate.class))).thenReturn(hallAdmin);

        // WHEN
        HallAssociateProfileResponse response =
                hallAssociateService.updateMyProfile(hallAdminId, Role.HALL_ADMIN, request);

        // THEN
        assertEquals("Updated Name", response.fullName());

        // VERIFY
        verify(hallAssociateRepository).save(hallAdmin);
    }

    @Test
    @DisplayName("Update My Profile: Inactive associate should throw BadRequestException")
    void shouldThrowBadRequestExceptionWhenAssociateIsInactive() {

        // GIVEN
        hallAdmin.setActive(false);
        UpdateHallAssociateProfileRequest request = new UpdateHallAssociateProfileRequest("Updated Name", "0199999999");

        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN & THEN
        assertThrows(BadRequestException.class,
                () -> hallAssociateService.updateMyProfile(hallAdminId, Role.HALL_ADMIN, request));

        // VERIFY
        verify(hallAssociateRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update My Profile: Should throw NotFoundException when associate does not exist")
    void shouldThrowNotFoundExceptionWhenUpdatingUnknownAssociate() {

        // GIVEN
        UpdateHallAssociateProfileRequest request = new UpdateHallAssociateProfileRequest("Updated Name", "0199999999");
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallAssociateService.updateMyProfile(hallAdminId, Role.HALL_ADMIN, request));
    }

    // ============================= countAccounts =============================

    @Test
    @DisplayName("Count Accounts: SUPER_ADMIN should return global counts")
    void shouldReturnGlobalCountsWhenSuperAdminCountsAccounts() {

        // GIVEN
        when(hallAssociateRepository.countByRoleAndIsActiveTrue(Role.HALL_ADMIN)).thenReturn(3L);
        when(hallAssociateRepository.countByRoleAndIsActiveTrue(Role.HALL_STAFF)).thenReturn(10L);

        // WHEN
        Map<String, Long> result = hallAssociateService.countAccounts(superAdminId, Role.SUPER_ADMIN);

        // THEN
        assertEquals(3L, result.get("active_hall_admins"));
        assertEquals(10L, result.get("active_hall_staff"));
    }

    @Test
    @DisplayName("Count Accounts: HALL_ADMIN should return hall scoped counts")
    void shouldReturnHallScopedCountsWhenHallAdminCountsAccounts() {

        // GIVEN
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallAssociateRepository.countByHallIdAndRole(hallId, Role.HALL_STAFF)).thenReturn(10L);
        when(hallAssociateRepository.countByHallIdAndRoleAndIsActiveTrue(hallId, Role.HALL_STAFF)).thenReturn(7L);

        // WHEN
        Map<String, Long> result = hallAssociateService.countAccounts(hallAdminId, Role.HALL_ADMIN);

        // THEN
        assertEquals(10L, result.get("total_hall_staff"));
        assertEquals(7L, result.get("active_hall_staff"));
        assertEquals(3L, result.get("inactive_hall_staff"));
    }

    @Test
    @DisplayName("Count Accounts: Invalid role should throw AccessDenied")
    void shouldThrowAccessDeniedForInvalidRoleOnCountAccounts() {

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.countAccounts(UUID.randomUUID(), Role.STUDENT));
    }

    // ============================= updateStatus =============================

    @Test
    @DisplayName("Update Status: SUPER_ADMIN should suspend an active account")
    void shouldSuspendActiveAccountWhenSuperAdminUpdatesStatus() {

        // GIVEN
        when(hallAssociateRepository.findById(hallStaff.getId())).thenReturn(Optional.of(hallStaff));
        when(hallAssociateRepository.save(any(HallAssociate.class))).thenReturn(hallStaff);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = hallAssociateService.updateStatus(superAdminId, Role.SUPER_ADMIN, hallStaff.getId());

            // THEN
            assertTrue(response.success());
            assertFalse(hallStaff.isActive());
        }
    }

    @Test
    @DisplayName("Update Status: SUPER_ADMIN should activate an inactive account")
    void shouldActivateInactiveAccountWhenSuperAdminUpdatesStatus() {

        // GIVEN
        hallStaff.setActive(false);
        when(hallAssociateRepository.findById(hallStaff.getId())).thenReturn(Optional.of(hallStaff));
        when(hallAssociateRepository.save(any(HallAssociate.class))).thenReturn(hallStaff);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = hallAssociateService.updateStatus(superAdminId, Role.SUPER_ADMIN, hallStaff.getId());

            // THEN
            assertTrue(response.success());
            assertTrue(hallStaff.isActive());
        }
    }

    @Test
    @DisplayName("Update Status: HALL_ADMIN should suspend staff from the same hall")
    void shouldSuspendStaffWhenHallAdminUpdatesStatusForSameHall() {

        // GIVEN
        when(hallAssociateRepository.findById(hallStaff.getId())).thenReturn(Optional.of(hallStaff));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallAssociateRepository.save(any(HallAssociate.class))).thenReturn(hallStaff);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = hallAssociateService.updateStatus(hallAdminId, Role.HALL_ADMIN, hallStaff.getId());

            // THEN
            assertTrue(response.success());
            assertFalse(hallStaff.isActive());
        }
    }

    @Test
    @DisplayName("Update Status: HALL_ADMIN targeting a different hall should throw AccessDenied")
    void shouldThrowAccessDeniedWhenHallAdminUpdatesStatusForDifferentHall() {

        // GIVEN
        HallAssociate otherHallStaff = HallAssociate.builder()
                .id(UUID.randomUUID())
                .role(Role.HALL_STAFF)
                .hallId(UUID.randomUUID())
                .isActive(true)
                .build();

        when(hallAssociateRepository.findById(otherHallStaff.getId())).thenReturn(Optional.of(otherHallStaff));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.updateStatus(hallAdminId, Role.HALL_ADMIN, otherHallStaff.getId()));
    }

    @Test
    @DisplayName("Update Status: HALL_ADMIN targeting a SUPER_ADMIN should throw AccessDenied")
    void shouldThrowAccessDeniedWhenHallAdminTargetsSuperAdmin() {

        // GIVEN
        HallAssociate superAdminTarget = HallAssociate.builder()
                .id(UUID.randomUUID())
                .role(Role.SUPER_ADMIN)
                .hallId(hallId)
                .isActive(true)
                .build();

        when(hallAssociateRepository.findById(superAdminTarget.getId())).thenReturn(Optional.of(superAdminTarget));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.updateStatus(hallAdminId, Role.HALL_ADMIN, superAdminTarget.getId()));
    }

    @Test
    @DisplayName("Update Status: Invalid requester role should throw AccessDenied")
    void shouldThrowAccessDeniedForInvalidRoleOnUpdateStatus() {

        // GIVEN
        when(hallAssociateRepository.findById(hallStaff.getId())).thenReturn(Optional.of(hallStaff));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> hallAssociateService.updateStatus(UUID.randomUUID(), Role.STUDENT, hallStaff.getId()));
    }

    @Test
    @DisplayName("Update Status: Should throw NotFoundException when target does not exist")
    void shouldThrowNotFoundExceptionWhenTargetDoesNotExist() {

        // GIVEN
        UUID targetId = UUID.randomUUID();
        when(hallAssociateRepository.findById(targetId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> hallAssociateService.updateStatus(superAdminId, Role.SUPER_ADMIN, targetId));
    }
}