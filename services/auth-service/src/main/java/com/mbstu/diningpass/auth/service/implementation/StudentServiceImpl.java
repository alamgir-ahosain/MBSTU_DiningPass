package com.mbstu.diningpass.auth.service.implementation;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileAdminResponse;
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
import com.mbstu.diningpass.auth.repository.StudentRepository;
import com.mbstu.diningpass.auth.service.abstraction.StudentService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final HallRepository hallRepository;
    private final HallAssociateRepository hallAssociateRepository;
    private static final Logger logger = LoggerFactory.getLogger(StudentServiceImpl.class);





    // Register — evict studentList since a new student changes all list results
    @Override
    @Transactional
    @CacheEvict(value = "studentList", allEntries = true)
    public StudentProfileResponse register(StudentRegistrationRequest request) {

        logger.warn("auth-service/student: DIRECT DB CALL for register");

        //  Step 0: Validation
        if (studentRepository.existsByStudentId(request.studentId())) {
            logger.warn("Student with studentId {} already exists", request.studentId());
            throw new DuplicateResourceException("Student with studentId already exists");
        }

        if (studentRepository.existsByEmail(request.email())) {
            logger.warn("Student with email {} already exists", request.email());
            throw new DuplicateResourceException("Student with email already exists");
        }

        Hall hall=hallRepository.findByShortNameAndIsActiveTrue(request.hallShortName()).orElseThrow(() -> {
            logger.error("Hall not found with short name: {}", request.hallShortName());
            return new ResourceNotFoundException("Hall not found with short name: " + request.hallShortName());
        });


        if (request.gender() != hall.getGenderType()) {
            logger.error("Gender mismatch: {} vs {}", request.gender(), hall.getGenderType());
            throw new BadRequestException("Gender does not match hall gender");
        }

        UserRecord firebaseUser = null;

        try {
            //  Step 0: Check if Firebase user already exists with this email
            try {
                UserRecord existingFirebaseUser = FirebaseAuth.getInstance().getUserByEmail(request.email());
                logger.error("Firebase user already exists with email: {}", request.email());
                throw new DuplicateResourceException("Email already exists in Firebase authentication");
            } catch (FirebaseAuthException e) {
                // If user doesn't exist, Firebase throws an exception — this is expected, so we continue
                logger.debug("Firebase check: User not found (expected), error: {}", e.getMessage());
                // Continue to create the user
            }

            //  Step 1: Create Firebase user
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.email())
                    .setPassword(request.password())
                    .setDisplayName(request.fullName())
                    .setEmailVerified(false);

            firebaseUser = FirebaseAuth.getInstance().createUser(createRequest);
            logger.info("Firebase user created: {}", firebaseUser.getUid());

            //  Step 2: Save student in DB with REAL firebase UID
            Student student = Student.builder()
                    .studentId(request.studentId())
                    .fullName(request.fullName())
                    .email(request.email())
                    .role(Role.STUDENT)
                    .hallId(hall.getId())
                    .roomNumber(request.roomNumber())
                    .department(request.department())
                    .gender(request.gender())
                    .firebaseUid(firebaseUser.getUid())
                    .build();

            Student savedStudent = studentRepository.save(student);
            logger.info("Student saved in DB: {}", savedStudent.getId());

            //  Step 3: Set Firebase custom claims AFTER DB success
            Map<String, Object> claims = Map.of(
                    "dbId", savedStudent.getId().toString(),
                    "role", savedStudent.getRole().name()
            );

            FirebaseAuth.getInstance().setCustomUserClaims(firebaseUser.getUid(), claims);
            logger.info("Custom claims set for Firebase user: {}", firebaseUser.getUid());

            return mapToResponse(savedStudent,hall);

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







    // Update own profile — evict own profile + student list (fullName/room changed)
    @Override
    @Caching(evict = {
            @CacheEvict(value = "studentProfile", key = "'profile:' + #requesterId"),
            @CacheEvict(value = "studentList",    allEntries = true)
    })
    public StudentProfileResponse updateMyProfile(UUID requesterId, Role role, UpdateStudentProfileRequest request) {

        logger.warn("auth-service/student: DIRECT DB CALL for updateMyProfile");

        if (role != Role.STUDENT) {
            throw new ForbiddenException("Only students can update their profile");
        }

        Student student = studentRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Hall hall = hallRepository.findById(student.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
        
        if (!student.isActive()) {
            logger.warn("Student {} is inactive", requesterId);
            throw new BadRequestException("Inactive student cannot be updated");
        }

        student.setFullName(request.fullName());
        student.setRoomNumber(request.roomNumber());

        studentRepository.save(student);
        logger.info("[PROFILE_UPDATED] student={}", requesterId);
        return mapToResponse(student,hall);
    }






    // Get own profile — cache per student UUID
    @Override
    @Cacheable(value = "studentProfile", key = "'profile:' + #requesterId")
    public StudentProfileResponse getMyProfile(UUID requesterId, Role role) {

        logger.warn("auth-service/student: DIRECT DB CALL for getMyProfile");

//        if (role != Role.STUDENT) {
//            if (role==Role.HALL_STAFF){
//                Student student = studentRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
//                Hall hall = hallRepository.findById(student.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
//                return mapToResponse(student,hall);
//            }
//            throw new ForbiddenException("Only students can access their profile");
//        }

        Student student = studentRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Hall hall = hallRepository.findById(student.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
        return mapToResponse(student,hall);
    }




    // Suspend / activate — evict target's profile + all list pages
    @Override
    @Caching(evict = {
            @CacheEvict(value = "studentProfile", key = "'profile:' + #targetId"),
            @CacheEvict(value = "studentList",    allEntries = true)
    })
    public MessageResponse suspendStudent(UUID requesterId, Role role, UUID targetId) {

        logger.warn("auth-service/student: DIRECT DB CALL for suspendStudent");

        Student target = studentRepository.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // SUPER_ADMIN — toggle any student account
        if (role == Role.SUPER_ADMIN) {
            return doUpdateStatus(target, !target.isActive());
        }

        // HALL_ADMIN — toggle only within own hall
        if (role == Role.HALL_ADMIN) {
            HallAssociate requester = hallAssociateRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

            if (!requester.getHallId().equals(target.getHallId())) {
                throw new AccessDeniedException("Cannot change status outside your hall");
            }

            if (target.getRole() == Role.SUPER_ADMIN) {
                throw new AccessDeniedException("Cannot change status of SUPER_ADMIN");
            }

            return doUpdateStatus(target, !target.isActive());
        }

        throw new AccessDeniedException("Not allowed to change account status");
    }

    private MessageResponse doUpdateStatus(Student student, boolean activate) {

        if (student.isActive() == activate) {
            return new MessageResponse("Already " + (activate ? "active" : "inactive"), false);
        }

        student.setActive(activate);
        student.setUpdatedAt(LocalDateTime.now());

        logger.info("[{}] target={}", activate ? "ACTIVATE" : "SUSPEND", student.getId());

        try {
            FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(student.getFirebaseUid()).setDisabled(!activate));
        } catch (FirebaseAuthException e) {
            logger.warn("Firebase {} failed: {}", activate ? "enable" : "disable", e.getMessage());
        }

        studentRepository.save(student);
        return new MessageResponse(student.getRole() + (activate ? " activated" : " suspended") + " successfully", true);
    }


    // getAllStudents — NOT cached intentionally
    // Reasons: Page<> serialization is fragile with Redis; result varies by
    // page/size/hallId/role (too many key combinations); data changes on
    // every register/suspend. A DB paginated query is fast enough.
    @Override
    public Page<StudentProfileAdminResponse> getAllStudents(UUID requesterId, Role role, UUID hallId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        // ================= HALL ADMIN =================
        if (role == Role.HALL_ADMIN) {

            HallAssociate requester = hallAssociateRepository.findById(requesterId).orElseThrow(() -> new ResourceNotFoundException("Requester not found"));
            UUID myHallId = requester.getHallId();

            if (hallId != null && !hallId.equals(myHallId)) {
                throw new ForbiddenException("Cannot access students from another hall");
            }
            Hall hall = hallRepository.findById(myHallId).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

            Page<Student> students = studentRepository.findByHallId(myHallId, pageable);

            return students.map(student -> new StudentProfileAdminResponse(
                    student.getId(),
                    student.getStudentId(),
                    student.getFullName(),
                    student.getEmail(),
                    hall.getShortName(),
                    student.getRoomNumber(),
                    student.getDepartment(),
                    student.isActive()
            ));
        }

        // ================= SUPER ADMIN =================
        if (role == Role.SUPER_ADMIN) {
            Page<Student> students;
            if (hallId != null) {
                students = studentRepository.findByHallId(hallId, pageable);
            } else {
                students = studentRepository.findAll(pageable);
            }
            return students.map(student -> {
                Hall hall = hallRepository.findById(student.getHallId()).orElse(null);
                return new StudentProfileAdminResponse(
                        student.getId(),
                        student.getStudentId(),
                        student.getFullName(),
                        student.getEmail(),
                        hall != null ? hall.getShortName() : "N/A",
                        student.getRoomNumber(),
                        student.getDepartment(),
                        student.isActive()
                );
            });
        }

        // ================= OTHERS =================
        throw new ForbiddenException("Not allowed to view students");
    }







    private StudentProfileResponse mapToResponse(Student student,Hall hall){
        return new StudentProfileResponse(
                
                student.getStudentId(),
                student.getFullName(),
                student.getEmail(),
                student.getRole(),
                hall.getShortName(),
                student.getRoomNumber(),
                student.getDepartment(),
                student.getGender(),
                student.isActive(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }


//    private StudentProfileAdminResponse mapToResponseAdmin(Student student){
//
//        Hall hall = hallRepository.findById(student.getHallId()).orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
//        return new StudentProfileAdminResponse(
//
//                student.getId(),
//                student.getStudentId(),
//                student.getFullName(),
//                student.getEmail(),
//                student.getRole(),
//                hall.getShortName(),
//                student.getRoomNumber(),
//                student.getDepartment(),
//                student.getGender(),
//                student.isActive(),
//                student.getCreatedAt(),
//                student.getUpdatedAt()
//        );
//    }



}
