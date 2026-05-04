package com.mbstu.diningpass.auth.service.implementation;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.student.StudentResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.Student;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.exception.BadRequestException;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.repository.StudentRepository;
import com.mbstu.diningpass.auth.service.abstraction.StudentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(StudentServiceImpl.class);





    @Transactional
    @Override
    public StudentResponse register(StudentRegistrationRequest request) {

        //  Step 0: Validation
        if (studentRepository.existsByStudentId(request.studentId())) {
            logger.warn("Student with studentId {} already exists", request.studentId());
            throw new DuplicateResourceException("Student with studentId already exists");
        }

        if (studentRepository.existsByEmail(request.email())) {
            logger.warn("Student with email {} already exists", request.email());
            throw new DuplicateResourceException("Student with email already exists");
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
                    .hallId(request.hallId())
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

            return mapToResponse(savedStudent);

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
    public StudentResponse updateStudent(UUID id, UpdateStudentProfileRequest request){

        Student existingStudent=studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        if (!existingStudent.isActive()){
            logger.warn("Student {} is already inactive", id);
            throw new IllegalStateException("Inactive student cannot be updated");        }

        existingStudent.setFullName(request.fullName());
        existingStudent.setRoomNumber(request.roomNumber());
        studentRepository.save(existingStudent);
        logger.info("Student updated successfully: {}", existingStudent.getFullName());
        return mapToResponse(existingStudent);
    }



    @Override
    public MessageResponse suspendStudent(UUID id, SuspendStudentRequest request){
        Student student=studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        if (!student.isActive()){
            logger.warn("Student {} is already inactive", id);
            return new MessageResponse("Student is already inactive", false);
        }
        student.setActive(false);
        student.setUpdatedAt(LocalDateTime.now());


        // Also disable the Firebase account so all tokens are immediately invalidated
        // (Firebase tokens expire in 1 hour, but disabling blocks them right away)
        try {
            FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(student.getFirebaseUid()).setDisabled(true));
        } catch (FirebaseAuthException e) {
            logger.warn("Could not disable Firebase account for student {}: {}", id, e.getMessage());
        }


        studentRepository.save(student);
        logger.info("Student suspended: {}, reason: {}", student.getFullName(), request.reason());
        return new MessageResponse("Student suspended successfully", true);
    }














    @Override
    public StudentResponse getStudentById(UUID id){
        return mapToResponse(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id))
        );
    }



    @Override
    public List<StudentResponse> getAllStudent(){
        return studentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }




    @Override
    public List<StudentResponse> getAllActiveStudent(){
        return studentRepository.findAll()
                .stream()
                .filter(Student::isActive)
                .map(this::mapToResponse)
                .toList();
    }




    private StudentResponse mapToResponse(Student student){
        return new StudentResponse(
                student.getId(),
                student.getStudentId(),
                student.getFullName(),
                student.getEmail(),
                student.getRole(),
                student.getHallId(),
                student.getRoomNumber(),
                student.getDepartment(),
                student.getGender(),
                student.isActive(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }



}
