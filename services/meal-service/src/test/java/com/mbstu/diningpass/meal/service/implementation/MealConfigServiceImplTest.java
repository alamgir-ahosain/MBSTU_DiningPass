package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealconfig.MealConfigAdminResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.BadRequestException;
import com.mbstu.diningpass.meal.exception.DuplicateResourceException;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link MealConfigServiceImpl}.
 * <p>
 * Dependencies (MealConfigRepository, HallAssociateFeignClient, StudentFeignClient,
 * CacheManager) are mocked with Mockito. No Spring context is loaded.
 */

@ExtendWith(MockitoExtension.class)
class MealConfigServiceImplTest {

    @Mock
    private MealConfigRepository mealConfigRepository;

    @Mock
    private HallAssociateFeignClient hallAssociateFeignClient;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private StudentFeignClient studentFeignClient;

    @Mock
    private Cache cache;

    @InjectMocks
    private MealConfigServiceImpl mealConfigService;

    private UUID requesterId;
    private HallAssociateProfileResponse adminProfile;

    @BeforeEach
    void setUp() {
        requesterId = UUID.randomUUID();
        adminProfile = new HallAssociateProfileResponse(
                "JAMH Provost",
                "provost.jamh@gmail.com",
                "01700000000",
                 Role.HALL_ADMIN,
                "JAMH",
                true,
                null,
                null
        );
    }


       /*
        _________________________________________________________________
        createMealConfig
        _________________________________________________________________
    */
    @Nested
    @DisplayName("createMealConfig")
    class CreateMealConfig {

        private CreateMealConfigRequest validRequest() {
            return new CreateMealConfigRequest(
                    LocalDate.now().plusDays(1),
                    MealType.LUNCH,
                    "Rice, Chicken",
                    60L,
                    LocalTime.of(10, 0),
                    LocalTime.of(14, 0),
                    null
            );
        }

        @Test
        @DisplayName("creates a config successfully for HALL_ADMIN and evicts cache")
        void createsSuccessfully() {
            CreateMealConfigRequest request = validRequest();

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.existsByHallShortNameAndMealDateAndMealType(
                    "JAMH", request.mealDate(), request.mealType())).thenReturn(false);
            when(mealConfigRepository.save(any(MealConfig.class)))
                    .thenAnswer(invocation -> {
                        MealConfig saved = invocation.getArgument(0);
                        saved.setId(UUID.randomUUID());
                        return saved;
                    });
            when(cacheManager.getCache("mealConfigs")).thenReturn(cache);

            MealConfigAdminResponse response = mealConfigService.createMealConfig(requesterId, Role.HALL_ADMIN, request);

            assertThat(response).isNotNull();
            assertThat(response.hallShortName()).isEqualTo("JAMH");
            assertThat(response.mealType()).isEqualTo(MealType.LUNCH);
            assertThat(response.createdByName()).isEqualTo("JAMH Provost");
            assertThat(response.updatedByName()).isEqualTo("JAMH Provost");

            verify(mealConfigRepository).save(any(MealConfig.class));
            verify(cache).evict("JAMH");
        }


        @Test
        @DisplayName("throws ForbiddenException when role is STUDENT")
        void throwsForbiddenForStudentRole() {
            CreateMealConfigRequest request = validRequest();

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.STUDENT, request))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("create meal configurations");

            verifyNoInteractions(mealConfigRepository);
        }

        @Test
        @DisplayName("throws ForbiddenException when HALL_STAFF has no hall assigned")
        void throwsForbiddenWhenStaffHasNoHall() {
            CreateMealConfigRequest request = validRequest();
            HallAssociateProfileResponse noHallProfile = new HallAssociateProfileResponse(
                    "Staff Guy", "staff@mbstu.ac.bd", "017", Role.HALL_STAFF, null, true, null, null);

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(noHallProfile);

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.HALL_STAFF, request))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Contact a Hall Admin");
        }

        @Test
        @DisplayName("throws ForbiddenException when HALL_ADMIN has no hall assigned")
        void throwsForbiddenWhenAdminHasNoHall() {
            CreateMealConfigRequest request = validRequest();
            HallAssociateProfileResponse noHallProfile = new HallAssociateProfileResponse(
                    "Admin Guy", "admin@mbstu.ac.bd", "017", Role.HALL_ADMIN, null, true, null, null);

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(noHallProfile);

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.HALL_ADMIN, request))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Contact a Super Admin");
        }

        @Test
        @DisplayName("throws BadRequestException when cutTokenBefore is not before tokenExpires")
        void throwsBadRequestForInvalidTimeWindow() {
            CreateMealConfigRequest badRequest = new CreateMealConfigRequest(
                    LocalDate.now().plusDays(1),
                    MealType.LUNCH,
                    "Rice, Dal",
                    60L,
                    LocalTime.of(15, 0),   // cutTokenBefore AFTER tokenExpires
                    LocalTime.of(14, 0),
                    null
            );

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.HALL_ADMIN, badRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("must be earlier than");

            verify(mealConfigRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws DuplicateResourceException when a config already exists (fast path)")
        void throwsDuplicateWhenExistsCheckTrue() {
            CreateMealConfigRequest request = validRequest();

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.existsByHallShortNameAndMealDateAndMealType(
                    "JAMH", request.mealDate(), request.mealType())).thenReturn(true);

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.HALL_ADMIN, request))
                    .isInstanceOf(DuplicateResourceException.class);

            verify(mealConfigRepository, never()).save(any());
        }

        @Test
        @DisplayName("translates DataIntegrityViolationException race condition into DuplicateResourceException")
        void translatesRaceConditionIntoDuplicateException() {
            CreateMealConfigRequest request = validRequest();

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.existsByHallShortNameAndMealDateAndMealType(
                    "JAMH", request.mealDate(), request.mealType())).thenReturn(false);
            when(mealConfigRepository.save(any(MealConfig.class)))
                    .thenThrow(new DataIntegrityViolationException("unique constraint violated"));

            assertThatThrownBy(() ->
                    mealConfigService.createMealConfig(requesterId, Role.HALL_ADMIN, request))
                    .isInstanceOf(DuplicateResourceException.class);

            // cache should not be evicted since the save failed
            verify(cacheManager, never()).getCache(anyString());
        }
    }

    /*
        _________________________________________________________________
        getAllMealConfigs
        _________________________________________________________________
    */

    @Nested
    @DisplayName("getAllMealConfigs")
    class GetAllMealConfigs {

        @Test
        @DisplayName("returns only open-for-booking configs for STUDENT, hiding admin-only fields")
        void returnsOpenConfigsForStudent() {
            StudentProfileResponse studentProfile = new StudentProfileResponse(
                    "S12345", "Jane Student", "jane@mbstu.ac.bd", Role.STUDENT,
                    "JAMH", "101", "CSE", null, true, null, null);

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);

            MealConfig openConfig = buildConfig(LocalDate.now(), LocalTime.now().plusHours(2));
            MealConfig closedConfig = buildConfig(LocalDate.now(), LocalTime.now().minusHours(2));

            when(mealConfigRepository.findByHallShortNameAndIsActiveTrueOrderByMealDateDesc("JAMH"))
                    .thenReturn(List.of(openConfig, closedConfig));

            List<MealConfigAdminResponse> result =
                    mealConfigService.getAllMealConfigs(requesterId, Role.STUDENT);

            assertThat(result).hasSize(1);
            MealConfigAdminResponse dto = result.get(0);
            assertThat(dto.id()).isEqualTo(openConfig.getId());
            assertThat(dto.isBookingOpen()).isTrue();
            // admin-only fields must be hidden for students
            assertThat(dto.totalTokensUsed()).isNull();
            assertThat(dto.totalTokenPending()).isNull();
            assertThat(dto.createdByName()).isNull();
            assertThat(dto.updatedByName()).isNull();
            assertThat(dto.updatedAt()).isNull();

            verifyNoInteractions(hallAssociateFeignClient);
        }

        @Test
        @DisplayName("returns configs for HALL_ADMIN with full admin fields populated")
        void returnsConfigsForAdmin() {
            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);

            MealConfig config = buildConfig(LocalDate.now(), LocalTime.now().plusHours(2));
            when(mealConfigRepository.findByHallShortNameAndIsActiveTrueOrderByMealDateDesc("JAMH"))
                    .thenReturn(List.of(config));

            List<MealConfigAdminResponse> result =
                    mealConfigService.getAllMealConfigs(requesterId, Role.HALL_ADMIN);

            assertThat(result).hasSize(1);
            MealConfigAdminResponse dto = result.get(0);
            assertThat(dto.totalTokensSold()).isEqualTo(config.getTotalSold());
            assertThat(dto.totalTokensUsed()).isEqualTo(config.getTotalUsed());
            assertThat(dto.totalTokenPending())
                    .isEqualTo(config.getTotalSold() - config.getTotalUsed());
            assertThat(dto.createdByName()).isEqualTo(config.getCreatedByName());

            verifyNoInteractions(studentFeignClient);
        }

        @Test
        @DisplayName("throws ForbiddenException for a role that is neither staff/admin nor student")
        void throwsForbiddenForSuperAdmin() {
            assertThatThrownBy(() ->
                    mealConfigService.getAllMealConfigs(requesterId, Role.SUPER_ADMIN))
                    .isInstanceOf(ForbiddenException.class);

            verifyNoInteractions(mealConfigRepository);
        }

        private MealConfig buildConfig(LocalDate mealDate, LocalTime cutTokenBefore) {
            return MealConfig.builder()
                    .id(UUID.randomUUID())
                    .hallShortName("JAMH")
                    .mealDate(mealDate)
                    .mealType(MealType.LUNCH)
                    .mealMenu("Rice, Dal")
                    .mealPrice(60L)
                    .cutTokenBefore(cutTokenBefore)
                    .tokenExpires(LocalTime.of(23, 0))
                    .isActive(true)
                    .totalSold(10L)
                    .totalUsed(4L)
                    .createdBy(UUID.randomUUID())
                    .updatedBy(UUID.randomUUID())
                    .createdByName("JAMH Provost")
                    .updatedByName("JAMH Provost")
                    .build();
        }
    }


    /*
     _________________________________________________________________
     updateMealConfig
     _________________________________________________________________
 */
    @Nested
    @DisplayName("updateMealConfig")
    class UpdateMealConfig {

        @Test
        @DisplayName("applies only non-null fields and evicts cache")
        void updatesOnlyProvidedFields() {
            UUID configId = UUID.randomUUID();
            MealConfig existing = MealConfig.builder()
                    .id(configId)
                    .hallShortName("JAMH")
                    .mealDate(LocalDate.now().plusDays(1))
                    .mealType(MealType.LUNCH)
                    .mealMenu("Old menu")
                    .mealPrice(50L)
                    .cutTokenBefore(LocalTime.of(10, 0))
                    .tokenExpires(LocalTime.of(14, 0))
                    .isActive(true)
                    .totalSold(0L)
                    .totalUsed(0L)
                    .createdByName("JAMH Provost")
                    .updatedByName("JAMH Provost")
                    .build();

            UpdateMealConfigRequest request = new UpdateMealConfigRequest(
                    "New menu", null, null, null, null, null);

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.findByIdAndHallShortName(configId, "JAMH"))
                    .thenReturn(Optional.of(existing));
            when(mealConfigRepository.save(any(MealConfig.class))).thenAnswer(inv -> inv.getArgument(0));
            when(cacheManager.getCache("mealConfigs")).thenReturn(cache);

            MealConfigAdminResponse response =
                    mealConfigService.updateMealConfig(requesterId, Role.HALL_ADMIN, configId, request);

            assertThat(response.mealMenu()).isEqualTo("New menu");
            assertThat(response.mealPrice()).isEqualTo(50L); // unchanged
            assertThat(response.cutTokenBefore()).isEqualTo(LocalTime.of(10, 0)); // unchanged

            verify(cache).evict("JAMH");
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when config does not belong to requester's hall")
        void throwsNotFoundWhenConfigMissing() {
            UUID configId = UUID.randomUUID();
            UpdateMealConfigRequest request = new UpdateMealConfigRequest(
                    "New menu", null, null, null, null, null);

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.findByIdAndHallShortName(configId, "JAMH"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    mealConfigService.updateMealConfig(requesterId, Role.HALL_ADMIN, configId, request))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(mealConfigRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws BadRequestException when updated time window is invalid")
        void throwsBadRequestForInvalidUpdatedWindow() {
            UUID configId = UUID.randomUUID();
            MealConfig existing = MealConfig.builder()
                    .id(configId)
                    .hallShortName("JAMH")
                    .mealDate(LocalDate.now().plusDays(1))
                    .mealType(MealType.LUNCH)
                    .mealMenu("Old menu")
                    .mealPrice(50L)
                    .cutTokenBefore(LocalTime.of(10, 0))
                    .tokenExpires(LocalTime.of(14, 0))
                    .isActive(true)
                    .build();

            // new cutTokenBefore (16:00) is after existing tokenExpires (14:00)
            UpdateMealConfigRequest request = new UpdateMealConfigRequest(
                    "Old menu", null, LocalTime.of(16, 0), null, null, null);

            when(hallAssociateFeignClient.getMyProfile()).thenReturn(adminProfile);
            when(mealConfigRepository.findByIdAndHallShortName(configId, "JAMH"))
                    .thenReturn(Optional.of(existing));

            assertThatThrownBy(() ->
                    mealConfigService.updateMealConfig(requesterId, Role.HALL_ADMIN, configId, request))
                    .isInstanceOf(BadRequestException.class);

            verify(mealConfigRepository, never()).save(any());
        }
    }
}