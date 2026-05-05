# Auth Service - Data Models & Schema Reference

---

## REQUEST DTOs

### **CreateHallRequest**

Used to create a new residential hall.

| Field         | Type   | Constraints           | Description                                                |
| ------------- | ------ | --------------------- | ---------------------------------------------------------- |
| `fullName`    | String | NOT NULL, 2-100 chars | Full name of the hall (e.g., "Jananeta Abdul Mannan Hall") |
| `shortName`   | String | NOT NULL, 2-100 chars | Abbreviated hall name (e.g., "JAMH")                       |
| `genderType`  | Enum   | NOT NULL              | Gender type: MALE, FEMALE                                  |
| `bkashNumber` | String | Max 15 chars          | Bkash mobile payment number                                |
| `nagadNumber` | String | Max 15 chars          | Nagad mobile payment number                                |
| `hallAdminId` | String | Nullable              | Hall administrator/provost ID                              |

---

### **HallAssociateRegistrationRequest**

Used to register hall staff members and associates.

| Field      | Type   | Constraints                   | Description                                              |
| ---------- | ------ | ----------------------------- | -------------------------------------------------------- |
| `fullName` | String | NOT NULL, 2-100 chars         | Full name of the associate                               |
| `email`    | String | NOT NULL, UNIQUE, Valid Email | University email address                                 |
| `phone`    | String | Max 15 chars                  | Contact phone number                                     |
| `role`     | Enum   | NOT NULL                      | Role: SUPER_ADMIN, HALL_ADMIN, COUNTER_STAFF, HALL_STAFF |
| `hallId`   | UUID   | NOT NULL                      | Reference to the assigned hall                           |

---

### **StudentRegistrationRequest**

Used to register a new student in the system.

| Field           | Type   | Constraints                                  | Description                             |
|-----------------|--------|----------------------------------------------|-----------------------------------------|
| `studentId`     | String | NOT NULL, UNIQUE, Max 20 chars               | University student ID (e.g., "CE21012") |
| `fullName`      | String | NOT NULL, 2-100 chars                        | Full name of the student                |
| `email`         | String | NOT NULL, UNIQUE, Valid Email, Max 150 chars | Student's university email              |
| `password`      | String | NOT NULL, Min 6 chars                        | Password for authentication             |
| `hallShortName` | String | NOT NULL, MIN 2, MAX 100 chars               | Hall short name (e.g. "JAMH")            |
| `roomNumber`    | String | Max 15 chars                                 | Room number within the hall             |
| `department`    | String | NOT NULL, Max 60 chars                       | Department name                         |
| `gender`        | Enum   | NOT NULL                                     | Gender: MALE, FEMALE                    |

---

### **FcmTokenUpdateRequest**

Used to update Firebase Cloud Messaging token for push notifications.

| Field      | Type   | Constraints | Description                    |
| ---------- | ------ | ----------- | ------------------------------ |
| `fcmToken` | String | NOT NULL    | Firebase Cloud Messaging token |

---

### **SuspendStudentRequest**

Used to suspend a student account with documented reason.

| Field    | Type   | Constraints             | Description           |
| -------- | ------ | ----------------------- | --------------------- |
| `reason` | String | NOT NULL, Max 255 chars | Reason for suspension |

---

### **TransferStudentRequest**

Used to transfer a student from one hall to another.

| Field           | Type   | Constraints             | Description              |
| --------------- | ------ | ----------------------- | ------------------------ |
| `newHallId`     | UUID   | NOT NULL                | UUID of destination hall |
| `newRoomNumber` | String | NOT NULL, Max 15 chars  | New room number          |
| `reason`        | String | NOT NULL, Max 255 chars | Reason for transfer      |

---

### **UpdateStudentProfileRequest**

Used by students to update their own profile information.

| Field        | Type   | Constraints           | Description         |
| ------------ | ------ | --------------------- | ------------------- |
| `fullName`   | String | NOT NULL, 2-100 chars | Updated full name   |
| `roomNumber` | String | Max 15 chars          | Updated room number |

---

## RESPONSE DTOs

### **AuthResponse**

Returned after successful user authentication with tokens and user info.

| Field          | Type   | Description                                                |
| -------------- | ------ | ---------------------------------------------------------- |
| `accessToken`  | String | JWT token for API authentication                           |
| `refreshToken` | String | JWT token for refreshing access token                      |
| `tokenType`    | String | Token type (typically "Bearer")                            |
| `expiresIn`    | Long   | Access token expiration in seconds                         |
| `role`         | String | User role: STUDENT, HALL_ADMIN, SUPER_ADMIN, COUNTER_STAFF |
| `userId`       | String | Unique user identifier                                     |
| `fullName`     | String | Full name of the user                                      |
| `hallId`       | String | UUID of the user's hall                                    |
| `hallName`     | String | Name of the user's hall                                    |

---

### **ErrorResponse**

Returned when an API request encounters an error.

| Field       | Type          | Description                                 |
| ----------- | ------------- | ------------------------------------------- |
| `timestamp` | LocalDateTime | Server time when error occurred             |
| `status`    | int           | HTTP status code (400, 401, 404, 500, etc.) |
| `error`     | String        | Error type/category                         |
| `message`   | String        | Detailed error message                      |

---

### **MessageResponse**

Simple response containing message and success status.

| Field     | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| `message` | String  | Response message                      |
| `success` | boolean | Operation success status (true/false) |

---

### **HallResponse**

Returned when retrieving or creating hall information.

| Field         | Type          | Description                |
| ------------- | ------------- | -------------------------- |
| `id`          | UUID          | Unique hall identifier     |
| `fullName`    | String        | Full name of the hall      |
| `shortName`   | String        | Abbreviated hall name      |
| `genderType`  | Enum          | Gender type: MALE, FEMALE  |
| `bkashNumber` | String        | Bkash payment number       |
| `nagadNumber` | String        | Nagad payment number       |
| `hallAdminId` | String        | Hall administrator ID      |
| `isActive`    | boolean       | Whether the hall is active |
| `createdAt`   | LocalDateTime | Hall creation timestamp    |

---

### **HallAssociateAdminResponse**

Returned when retrieving or creating hall associate/staff information.

| Field       | Type          | Description                                              |
| ----------- | ------------- | -------------------------------------------------------- |
| `id`        | UUID          | Unique hall associate identifier                         |
| `fullName`  | String        | Full name of the associate                               |
| `email`     | String        | Email address                                            |
| `phone`     | String        | Phone number                                             |
| `role`      | Enum          | Role: SUPER_ADMIN, HALL_ADMIN, COUNTER_STAFF, HALL_STAFF |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `isActive`  | boolean       | Whether account is active                                |
| `createdAt` | LocalDateTime | Account creation timestamp                               |
| `updatedAt` | LocalDateTime | Last update timestamp                                    |

---
### **HallAssociateProfileesponse**

Returned when retrieving or creating hall associate/staff information.

| Field       | Type          | Description                                              |
| ----------- | ------------- | -------------------------------------------------------- |
| `fullName`  | String        | Full name of the associate                               |
| `email`     | String        | Email address                                            |
| `phone`     | String        | Phone number                                             |
| `role`      | Enum          | Role: SUPER_ADMIN, HALL_ADMIN, COUNTER_STAFF, HALL_STAFF |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `isActive`  | boolean       | Whether account is active                                |
| `createdAt` | LocalDateTime | Account creation timestamp                               |
| `updatedAt` | LocalDateTime | Last update timestamp                                    |

---

### **StudentProfileResponse**

Returned when retrieving a student's profile (used for end-user views).

| Field          | Type          | Description                   |
| -------------- | ------------- | ----------------------------- |
| `studentId`    | String        | University student ID         |
| `fullName`     | String        | Full name of student          |
| `email`        | String        | Student email address         |
| `role`         | Enum          | User role (STUDENT or higher) |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `roomNumber`   | String        | Room number in hall (nullable)|
| `department`   | String        | Department name               |
| `gender`       | Enum          | Gender: MALE, FEMALE          |
| `isActive`     | boolean       | Whether account is active     |
| `createdAt`    | LocalDateTime | Account creation timestamp    |
| `updatedAt`    | LocalDateTime | Last update timestamp         |

---

### **StudentProfileAdminResponse**

Returned when retrieving a student's profile for administrative views (includes internal id).

| Field          | Type          | Description                   |
| -------------- | ------------- | ----------------------------- |
| `id`           | UUID          | Unique student identifier     |
| `studentId`    | String        | University student ID         |
| `fullName`     | String        | Full name of student          |
| `email`        | String        | Student email address         |
| `role`         | Enum          | User role (STUDENT or higher) |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `roomNumber`   | String        | Room number in hall (nullable)|
| `department`   | String        | Department name               |
| `gender`       | Enum          | Gender: MALE, FEMALE          |
| `isActive`     | boolean       | Whether account is active     |
| `createdAt`    | LocalDateTime | Account creation timestamp    |
| `updatedAt`    | LocalDateTime | Last update timestamp         |

---

## DATABASE ENTITIES

### **Table: `halls`**

| Column         | Type         | Constraints            | Description                   |
| -------------- | ------------ | ---------------------- | ----------------------------- |
| `id`           | UUID         | PK, AUTO-GENERATED     | Unique hall identifier        |
| `full_name`    | VARCHAR(200) | NOT NULL, UNIQUE       | Full name of the hall         |
| `short_name`   | VARCHAR(100) | NOT NULL, UNIQUE       | Abbreviated hall name         |
| `gender_type`  | VARCHAR(20)  | NOT NULL               | Gender type: MALE, FEMALE     |
| `bkash_number` | VARCHAR(20)  | NOT NULL               | Bkash payment number          |
| `nagad_number` | VARCHAR(20)  | NULLABLE               | Nagad payment number          |
| `provost_id`   | VARCHAR(100) | NULLABLE               | Hall administrator/provost ID |
| `is_active`    | BOOLEAN      | NOT NULL, DEFAULT true | Hall active status            |
| `created_at`   | TIMESTAMP    | NOT NULL, AUTO-SET     | Record creation time          |
| `updated_at`   | TIMESTAMP    | NULLABLE, AUTO-SET     | Record last update time       |

---

### **Table: `hall_associates`**

| Column         | Type         | Constraints             | Description                                              |
| -------------- | ------------ | ----------------------- | -------------------------------------------------------- |
| `id`           | UUID         | PK, AUTO-GENERATED      | Unique associate identifier                              |
| `firebase_uid` | VARCHAR(128) | NOT NULL, UNIQUE        | Firebase authentication UID                              |
| `full_name`    | VARCHAR(100) | NOT NULL                | Full name of the associate                               |
| `email`        | VARCHAR(255) | NOT NULL, UNIQUE        | University email address                                 |
| `phone`        | VARCHAR(15)  | NULLABLE                | Contact phone number                                     |
| `role`         | VARCHAR(20)  | NOT NULL                | Role: SUPER_ADMIN, HALL_ADMIN, COUNTER_STAFF, HALL_STAFF |
| `hall_id`      | UUID         | NOT NULL, FK (halls.id) | Reference to assigned hall                               |
| `is_active`    | BOOLEAN      | NOT NULL, DEFAULT true  | Account active status                                    |
| `created_at`   | TIMESTAMP    | NOT NULL, AUTO-SET      | Record creation time                                     |
| `updated_at`   | TIMESTAMP    | NULLABLE, AUTO-SET      | Record last update time                                  |

---

### **Table: `students`**

| Column         | Type         | Constraints             | Description                           |
| -------------- | ------------ | ----------------------- | ------------------------------------- |
| `id`           | UUID         | PK, AUTO-GENERATED      | Unique student identifier             |
| `firebase_uid` | VARCHAR(128) | NOT NULL, UNIQUE        | Firebase authentication UID           |
| `student_id`   | VARCHAR(20)  | NOT NULL, UNIQUE        | University student ID (e.g., CE21012) |
| `full_name`    | VARCHAR(100) | NOT NULL                | Full name of the student              |
| `email`        | VARCHAR(150) | NOT NULL, UNIQUE        | Student's university email            |
| `role`         | VARCHAR(20)  | NOT NULL                | User role (STUDENT, HALL_ADMIN, etc.) |
| `hall_id`      | UUID         | NOT NULL, FK (halls.id) | Reference to residential hall         |
| `room_number`  | VARCHAR(15)  | NULLABLE                | Room number within the hall           |
| `department`   | VARCHAR(60)  | NOT NULL                | Department name                       |
| `gender`       | VARCHAR(20)  | NOT NULL                | Gender: MALE, FEMALE                  |
| `is_active`    | BOOLEAN      | NOT NULL, DEFAULT true  | Account active status                 |
| `fcm_token`    | TEXT         | NULLABLE                | Firebase Cloud Messaging token        |
| `created_at`   | TIMESTAMP    | NOT NULL, AUTO-SET      | Record creation time                  |
| `updated_at`   | TIMESTAMP    | NULLABLE, AUTO-SET      | Record last update time               |


## ENUMS 


- **GenderType:** MALE, FEMALE )
- **Role:** SUPER_ADMIN, HALL_ADMIN, COUNTER_STAFF, HALL_STAFF, STUDENT 
- **StudentStatus:** ACTIVE, SUSPEND 

---

**Version:** 1.0  
**Last Updated:** May 5, 2026  
**Auth Service:** 0.0.1-SNAPSHOT
