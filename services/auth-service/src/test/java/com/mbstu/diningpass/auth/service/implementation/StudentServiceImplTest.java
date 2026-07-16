package com.mbstu.diningpass.auth.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
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
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import com.google.firebase.auth.FirebaseAuth;
import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileAdminResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.HallAssociate;
import com.mbstu.diningpass.auth.entity.Student;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.BadRequestException;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ForbiddenException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallAssociateRepository;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.repository.StudentRepository;

// NOTE: static mocking of FirebaseAuth requires the "mockito-inline" (or Mockito 5+
// default inline mock maker) artifact on the test classpath.

@ExtendWith(MockitoExtension.class)
public class StudentServiceImplTest {

    @Mock             StudentRepository studentRepository;
    @InjectMocks  StudentServiceImpl studentService;
    @Mock             HallRepository hallRepository;
    @Mock             HallAssociateRepository hallAssociateRepository;

    private UUID studentId;
    private UUID hallAdminId;
    private UUID hallId;
    private Hall hall;
    private Student student;
    private HallAssociate hallAdmin;

    @BeforeEach
    void init() {
        studentId = UUID.randomUUID();
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

        student = Student.builder()
                .id(studentId)
                .studentId("CE21012")
                .fullName("Alamgir Hosain")
                .email("ce21012@mbstu.ac.bd")
                .role(Role.STUDENT)
                .hallId(hallId)
                .roomNumber("101")
                .department("CSE")
                .gender(GenderType.MALE)
                .firebaseUid("firebase-uid-student")
                .isActive(true)
                .build();

        hallAdmin = HallAssociate.builder()
                .id(hallAdminId)
                .fullName("JAMH Hall Provost")
                .role(Role.HALL_ADMIN)
                .hallId(hallId)
                .isActive(true)
                .build();
    }

    // ============================= register =============================
    // NOTE: register() calls FirebaseAuth.getInstance() statically and requires
    // mockito-inline / Mockito 5 inline mock maker for full coverage of the
    // Firebase-dependent success path. Below we cover the validation branches
    // that short-circuit before any Firebase interaction.

    @Test
    @DisplayName("Register: Duplicate student id should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenStudentIdAlreadyExists() {

        // GIVEN
        StudentRegistrationRequest request = new StudentRegistrationRequest(
                "CE21012", "Alamgir Hosain", "ce21012@mbstu.ac.bd", "password1",
                "JAMH", "101", "CSE", GenderType.MALE
        );
        when(studentRepository.existsByStudentId("CE21012")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> studentService.register(request));

        // VERIFY
        verify(hallRepository, never()).findByShortNameAndIsActiveTrue(any());
    }

    @Test
    @DisplayName("Register: Duplicate email should throw DuplicateResourceException")
    void shouldThrowDuplicateResourceExceptionWhenEmailAlreadyExists() {

        // GIVEN
        StudentRegistrationRequest request = new StudentRegistrationRequest(
                "CE21099", "Alamgir Hosain", "ce21012@mbstu.ac.bd", "password1",
                "JAMH", "101", "CSE", GenderType.MALE
        );
        when(studentRepository.existsByStudentId("CE21099")).thenReturn(false);
        when(studentRepository.existsByEmail("ce21012@mbstu.ac.bd")).thenReturn(true);

        // WHEN & THEN
        assertThrows(DuplicateResourceException.class,
                () -> studentService.register(request));
    }

    @Test
    @DisplayName("Register: Should throw NotFoundException when hall does not exist")
    void shouldThrowResourceNotFoundExceptionWhenHallDoesNotExist() {

        // GIVEN
        StudentRegistrationRequest request = new StudentRegistrationRequest(
                "CE21099", "Alamgir Hosain", "ce21012@mbstu.ac.bd", "password1",
                "UNKNOWN", "101", "CSE", GenderType.MALE
        );
        when(studentRepository.existsByStudentId("CE21099")).thenReturn(false);
        when(studentRepository.existsByEmail("ce21012@mbstu.ac.bd")).thenReturn(false);
        when(hallRepository.findByShortNameAndIsActiveTrue("UNKNOWN")).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> studentService.register(request));
    }

    @Test
    @DisplayName("Register: Gender mismatch with hall should throw BadRequestException")
    void shouldThrowBadRequestExceptionWhenGenderMismatchesHall() {

        // GIVEN
        StudentRegistrationRequest request = new StudentRegistrationRequest(
                "CE21099", "Jane Doe", "jane@mbstu.ac.bd", "password1",
                "JAMH", "101", "CSE", GenderType.FEMALE
        );
        when(studentRepository.existsByStudentId("CE21099")).thenReturn(false);
        when(studentRepository.existsByEmail("jane@mbstu.ac.bd")).thenReturn(false);
        when(hallRepository.findByShortNameAndIsActiveTrue("JAMH")).thenReturn(Optional.of(hall));

        // WHEN & THEN
        assertThrows(BadRequestException.class,
                () -> studentService.register(request));
    }

    // ============================= updateMyProfile =============================

    @Test
    @DisplayName("Update My Profile: Should update successfully")
    void shouldUpdateMyProfileSuccessfully() {

        // GIVEN
        UpdateStudentProfileRequest request = new UpdateStudentProfileRequest("Updated Name", "202");
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // WHEN
        StudentProfileResponse response = studentService.updateMyProfile(studentId, Role.STUDENT, request);

        // THEN
        assertEquals("Updated Name", response.fullName());
        assertEquals("202", response.roomNumber());
    }

    @Test
    @DisplayName("Update My Profile: Non STUDENT role should throw Forbidden")
    void shouldThrowForbiddenWhenNonStudentUpdatesProfile() {

        // GIVEN
        UpdateStudentProfileRequest request = new UpdateStudentProfileRequest("Updated Name", "202");

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> studentService.updateMyProfile(hallAdminId, Role.HALL_ADMIN, request));

        // VERIFY
        verifyNoInteractions(studentRepository);
    }

    @Test
    @DisplayName("Update My Profile: Should throw NotFoundException when student does not exist")
    void shouldThrowResourceNotFoundExceptionWhenUpdatingUnknownStudent() {

        // GIVEN
        UpdateStudentProfileRequest request = new UpdateStudentProfileRequest("Updated Name", "202");
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> studentService.updateMyProfile(studentId, Role.STUDENT, request));
    }

    @Test
    @DisplayName("Update My Profile: Inactive student should throw BadRequestException")
    void shouldThrowBadRequestExceptionWhenStudentIsInactive() {

        // GIVEN
        student.setActive(false);
        UpdateStudentProfileRequest request = new UpdateStudentProfileRequest("Updated Name", "202");
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN & THEN
        assertThrows(BadRequestException.class,
                () -> studentService.updateMyProfile(studentId, Role.STUDENT, request));

        // VERIFY
        verify(studentRepository, never()).save(any());
    }

    // ============================= getMyProfile =============================

    @Test
    @DisplayName("Get My Profile: Should return profile successfully")
    void shouldReturnMyProfileSuccessfully() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        StudentProfileResponse response = studentService.getMyProfile(studentId, Role.STUDENT);

        // THEN
        assertEquals("CE21012", response.studentId());
        assertEquals("JAMH", response.hallShortName());
    }

    @Test
    @DisplayName("Get My Profile: Should throw NotFoundException when student does not exist")
    void shouldThrowResourceNotFoundExceptionWhenStudentDoesNotExist() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> studentService.getMyProfile(studentId, Role.STUDENT));
    }

    @Test
    @DisplayName("Get My Profile: Should throw NotFoundException when hall does not exist")
    void shouldThrowResourceNotFoundExceptionWhenStudentsHallDoesNotExist() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(hallRepository.findById(hallId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> studentService.getMyProfile(studentId, Role.STUDENT));
    }

    // ============================= suspendStudent =============================

    @Test
    @DisplayName("Suspend Student: SUPER_ADMIN should suspend an active student")
    void shouldSuspendActiveStudentWhenSuperAdminSuspends() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = studentService.suspendStudent(UUID.randomUUID(), Role.SUPER_ADMIN, studentId);

            // THEN
            assertTrue(response.success());
            assertFalse(student.isActive());
        }
    }

    @Test
    @DisplayName("Suspend Student: SUPER_ADMIN should activate an inactive student")
    void shouldActivateInactiveStudentWhenSuperAdminSuspends() {

        // GIVEN
        student.setActive(false);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = studentService.suspendStudent(UUID.randomUUID(), Role.SUPER_ADMIN, studentId);

            // THEN
            assertTrue(response.success());
            assertTrue(student.isActive());
        }
    }

    @Test
    @DisplayName("Suspend Student: HALL_ADMIN should suspend a student from the same hall")
    void shouldSuspendStudentWhenHallAdminSuspendsSameHallStudent() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
            FirebaseAuth mockAuth = mock(FirebaseAuth.class);
            firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            // WHEN
            MessageResponse response = studentService.suspendStudent(hallAdminId, Role.HALL_ADMIN, studentId);

            // THEN
            assertTrue(response.success());
            assertFalse(student.isActive());
        }
    }

    @Test
    @DisplayName("Suspend Student: HALL_ADMIN targeting a different hall should throw AccessDenied")
    void shouldThrowAccessDeniedWhenHallAdminSuspendsDifferentHallStudent() {

        // GIVEN
        Student otherHallStudent = Student.builder()
                .id(UUID.randomUUID())
                .role(Role.STUDENT)
                .hallId(UUID.randomUUID())
                .firebaseUid("uid")
                .isActive(true)
                .build();
        when(studentRepository.findById(otherHallStudent.getId())).thenReturn(Optional.of(otherHallStudent));
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> studentService.suspendStudent(hallAdminId, Role.HALL_ADMIN, otherHallStudent.getId()));
    }

    @Test
    @DisplayName("Suspend Student: Invalid requester role should throw AccessDenied")
    void shouldThrowAccessDeniedForInvalidRoleOnSuspendStudent() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        // WHEN & THEN
        assertThrows(AccessDeniedException.class,
                () -> studentService.suspendStudent(UUID.randomUUID(), Role.HALL_STAFF, studentId));
    }

    @Test
    @DisplayName("Suspend Student: Should throw NotFoundException when target does not exist")
    void shouldThrowResourceNotFoundExceptionWhenSuspendingUnknownStudent() {

        // GIVEN
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class,
                () -> studentService.suspendStudent(UUID.randomUUID(), Role.SUPER_ADMIN, studentId));
    }

    // ============================= getAllStudents =============================

    @Test
    @DisplayName("Get All Students: HALL_ADMIN should receive a page for their own hall")
    void shouldReturnPageWhenHallAdminGetsOwnHallStudents() {

        // GIVEN
        Pageable pageable = PageRequest.of(0, 10);
        Page<Student> page = new PageImpl<>(List.of(student), pageable, 1);

        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));
        when(studentRepository.findByHallId(eq(hallId), any(Pageable.class))).thenReturn(page);

        // WHEN
        Page<StudentProfileAdminResponse> result =
                studentService.getAllStudents(hallAdminId, Role.HALL_ADMIN, null, 0, 10);

        // THEN
        assertEquals(1, result.getTotalElements());
        assertEquals("JAMH", result.getContent().get(0).hallShortName());
    }

    @Test
    @DisplayName("Get All Students: HALL_ADMIN requesting another hall should throw Forbidden")
    void shouldThrowForbiddenWhenHallAdminRequestsOtherHallStudents() {

        // GIVEN
        UUID otherHallId = UUID.randomUUID();
        when(hallAssociateRepository.findById(hallAdminId)).thenReturn(Optional.of(hallAdmin));

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> studentService.getAllStudents(hallAdminId, Role.HALL_ADMIN, otherHallId, 0, 10));
    }

    @Test
    @DisplayName("Get All Students: SUPER_ADMIN with hallId filter should return filtered page")
    void shouldReturnFilteredPageWhenSuperAdminFiltersByHall() {

        // GIVEN
        Pageable pageable = PageRequest.of(0, 10);
        Page<Student> page = new PageImpl<>(List.of(student), pageable, 1);

        when(studentRepository.findByHallId(eq(hallId), any(Pageable.class))).thenReturn(page);
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        Page<StudentProfileAdminResponse> result =
                studentService.getAllStudents(UUID.randomUUID(), Role.SUPER_ADMIN, hallId, 0, 10);

        // THEN
        assertEquals(1, result.getTotalElements());

        // VERIFY
        verify(studentRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("Get All Students: SUPER_ADMIN without hallId filter should return all students")
    void shouldReturnAllPageWhenSuperAdminHasNoHallFilter() {

        // GIVEN
        Pageable pageable = PageRequest.of(0, 10);
        Page<Student> page = new PageImpl<>(List.of(student), pageable, 1);

        when(studentRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(hallRepository.findById(hallId)).thenReturn(Optional.of(hall));

        // WHEN
        Page<StudentProfileAdminResponse> result =
                studentService.getAllStudents(UUID.randomUUID(), Role.SUPER_ADMIN, null, 0, 10);

        // THEN
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("Get All Students: Invalid requester role should throw Forbidden")
    void shouldThrowForbiddenForInvalidRoleOnGetAllStudents() {

        // WHEN & THEN
        assertThrows(ForbiddenException.class,
                () -> studentService.getAllStudents(studentId, Role.STUDENT, null, 0, 10));
    }
}