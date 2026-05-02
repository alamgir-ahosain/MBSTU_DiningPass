package com.mbstu.diningpass.auth.service.implementation;

import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.response.student.StudentResponse;
import com.mbstu.diningpass.auth.entity.Hall;
import com.mbstu.diningpass.auth.entity.Student;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.exception.DuplicateResourceException;
import com.mbstu.diningpass.auth.exception.ResourceNotFoundException;
import com.mbstu.diningpass.auth.repository.HallRepository;
import com.mbstu.diningpass.auth.repository.StudentRepository;
import com.mbstu.diningpass.auth.service.abstraction.StudentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final HallRepository hallRepository;
    private static final Logger logger = LoggerFactory.getLogger(StudentServiceImpl.class);



    public StudentResponse register(StudentRegistrationRequest request){
        if (studentRepository.existsByStudentId(request.studentId())){
            logger.warn("Student with studentId {} already exists", request.studentId());
            throw new DuplicateResourceException("Student with studentId already exists");
        }
        if (studentRepository.existsByEmail(request.email())){
            logger.warn("Student with email {} already exists", request.email());
            throw new DuplicateResourceException("Student with email already exists");
        }

        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> {
                    logger.error("Hall with ID {} not found for student registration", request.hallId());
                    return new IllegalArgumentException("Hall not found with ID: " + request.hallId());
                });

        GenderType genderType=hall.getGenderType();
        if (request.gender()!=genderType){
            logger.error("Gender {} does not match hall gender {}", request.gender(), genderType);
            throw new IllegalArgumentException("Gender does not match hall gender");
        }


        Student newStudent=Student.builder()
                .studentId(request.studentId())
                .fullName(request.fullName())
                .email(request.email())
                .password(request.password())
                .hallId(request.hallId())
                .roomNumber(request.roomNumber())
                .department(request.department())
                .gender(request.gender())
                .build();
        Student savedStudent=studentRepository.save(newStudent);
        logger.info("Student created successfully: {}", savedStudent);
          return mapToResponse(savedStudent);
    }


    public StudentResponse getStudentById(UUID id){
        return mapToResponse(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id))
        );
    }

    public List<StudentResponse> getAllStudent(){
        return studentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<StudentResponse> getAllActiveStudent(){
        return studentRepository.findAll()
                .stream()
                .filter(Student::isActive)
                .map(this::mapToResponse)
                .toList();
    }

    public  void deleteStudent(UUID id){
        Student student = studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        if (!student.isActive()) {
            logger.warn("Hall {} is already inactive", id);
            return;
        }

        student.setActive(false);
        studentRepository.save(student);
        logger.info("Hall soft-deleted: {}", student.getFullName());    }


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
