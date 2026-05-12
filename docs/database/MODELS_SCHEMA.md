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

| Field           | Type   | Constraints                   | Description                                              |
| --------------- | ------ | ----------------------------- | -------------------------------------------------------- |
| `fullName`      | String | NOT NULL, 2-100 chars         | Full name of the associate                               |
| `email`         | String | NOT NULL, UNIQUE, Valid Email | University email address                                 |
| `password`      | String | NOT NULL, Min 6 chars         | Login password for Firebase/auth account                 |
| `phone`         | String | Max 15 chars                  | Contact phone number                                     |
| `role`          | Enum   | NOT NULL                      | Role: SUPER_ADMIN, HALL_ADMIN, HALL_STAFF                |
| `hallShortName` | String | NOT NULL, 2-100 chars         | Short name of the assigned hall (e.g. "JAMH")           |

---

### **UpdateHallAssociateProfileRequest**

Used by hall associates to update their own profile details.

| Field      | Type   | Constraints           | Description           |
| ---------- | ------ | --------------------- | --------------------- |
| `fullName` | String | NOT NULL, 2-100 chars | Updated full name     |
| `phone`    | String | Max 15 chars          | Updated contact phone |

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

Used for documenting status-change reasons in legacy/compatibility flows. Current student and hall-associate status endpoints toggle directly and do not require a request body.

| Field    | Type   | Constraints             | Description                  |
| -------- | ------ | ----------------------- | ---------------------------- |
| `reason` | String | NOT NULL, Max 255 chars | Reason for status change     |

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
| `role`         | String | User role: STUDENT, HALL_ADMIN, HALL_STAFF, SUPER_ADMIN |
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

| Field         | Type          | Description                                          |
|---------------| ------------- |------------------------------------------------------|
| `id`          | UUID          | Unique hall identifier                               |
| `fullName`    | String        | Full name of the hall                                |
| `shortName`   | String        | Abbreviated hall name                                |
| `genderType`  | Enum          | Gender type: MALE, FEMALE                            |
| `bkashNumber` | String        | Bkash payment number                                 |
| `nagadNumber` | String        | Nagad payment number                                 |
| `hallAdminId` | String        | Hall administrator/provost ID stored in `provost_id` |
| `isActive`    | boolean       | Whether the hall is active                           |
| `createdAt`   | LocalDateTime | Hall creation timestamp                              |
| `updatedAt`   | LocalDateTime | Hall update timestamp                                |

---

### **HallAssociateAdminResponse**

Returned when retrieving or creating hall associate/staff information.

| Field       | Type          | Description                                              |
| ----------- | ------------- | -------------------------------------------------------- |
| `id`        | UUID          | Unique hall associate identifier                         |
| `fullName`  | String        | Full name of the associate                               |
| `email`     | String        | Email address                                            |
| `phone`     | String        | Phone number                                             |
| `role`      | Enum          | Role: SUPER_ADMIN, HALL_ADMIN, HALL_STAFF |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `isActive`  | boolean       | Whether account is active                                |
| `createdAt` | LocalDateTime | Account creation timestamp                               |
| `updatedAt` | LocalDateTime | Last update timestamp                                    |

---
### **HallAssociateProfileResponse**

Returned when retrieving or creating hall associate/staff information.

| Field       | Type          | Description                                              |
| ----------- | ------------- | -------------------------------------------------------- |
| `fullName`  | String        | Full name of the associate                               |
| `email`     | String        | Email address                                            |
| `phone`     | String        | Phone number                                             |
| `role`      | Enum          | Role: SUPER_ADMIN, HALL_ADMIN, HALL_STAFF |
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
| `role`         | Enum          | User role (STUDENT, HALL_STAFF, HALL_ADMIN, SUPER_ADMIN) |
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
| `role`         | Enum          | User role (STUDENT, HALL_STAFF, HALL_ADMIN, SUPER_ADMIN) |
| `hallShortName`| String        | Short name of the student's hall (e.g. "JAMH") |
| `roomNumber`   | String        | Room number in hall (nullable)|
| `department`   | String        | Department name               |
| `gender`       | Enum          | Gender: MALE, FEMALE          |
| `isActive`     | boolean       | Whether account is active     |
| `createdAt`    | LocalDateTime | Account creation timestamp    |
| `updatedAt`    | LocalDateTime | Last update timestamp         |

---

> Note: `meal-service` also uses client mirror DTOs under `dto/response/client/*` for hall, hall-associate, and student profile lookups. Their field sets match the auth-service tables above.

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
| `role`         | VARCHAR(20)  | NOT NULL                | Role: SUPER_ADMIN, HALL_ADMIN, HALL_STAFF |
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
| `role`         | VARCHAR(20)  | NOT NULL                | User role (STUDENT, HALL_ADMIN, HALL_STAFF, SUPER_ADMIN) |
| `hall_id`      | UUID         | NOT NULL, FK (halls.id) | Reference to residential hall         |
| `room_number`  | VARCHAR(15)  | NULLABLE                | Room number within the hall           |
| `department`   | VARCHAR(60)  | NOT NULL                | Department name                       |
| `gender`       | VARCHAR(20)  | NOT NULL                | Gender: MALE, FEMALE                  |
| `is_active`    | BOOLEAN      | NOT NULL, DEFAULT true  | Account active status                 |
| `fcm_token`    | TEXT         | NULLABLE                | Firebase Cloud Messaging token        |
| `created_at`   | TIMESTAMP    | NOT NULL, AUTO-SET      | Record creation time                  |
| `updated_at`   | TIMESTAMP    | NULLABLE, AUTO-SET      | Record last update time               |


## ENUMS 

- **GenderType:** `MALE`, `FEMALE`
- **Role:** `SUPER_ADMIN`, `HALL_ADMIN`, `HALL_STAFF`, `STUDENT`
- **MealType:** `LUNCH`, `DINNER`
- **PaymentMethod:** `BKASH`, `NAGAD`
- **PaymentStatus:** `SUBMITTED`, `VERIFIED`, `REJECTED`
- **TokenStatus:** `PAYMENT_SUBMITTED`, `APPROVED`, `USED`, `CANCELLED`
- **ScanMode:** `STAFF_SCANNED`, `STUDENT_SCANNED`

---


## Table: `meal_configs`

The `meal_configs` table stores daily meal planning information for each hall.  
Hall staff/admin creates one row per meal (`LUNCH` or `DINNER`) for a specific date.  
Students can view and cut meal tokens until the `cut_token_before` deadline.

| Column Name         | Type          | Constraints                                             | Description |
|---------------------|---------------|---------------------------------------------------------|-------------|
| `id`                | UUID          | PRIMARY KEY, AUTO-GENERATED                             | Unique identifier |
| `hall_short_name`   | VARCHAR(255)  | NOT NULL                                                | Hall short name (e.g. `JAMH`) |
| `meal_date`         | DATE          | NOT NULL                                                | Date the meal will be served |
| `meal_type`         | ENUM (`MealType`) | NOT NULL                                            | Meal type: `LUNCH` or `DINNER` |
| `meal_menu`         | VARCHAR(255)  | NULLABLE                                                | Meal menu description (e.g. `"Rice, Fish, Dal"`) |
| `meal_price`        | BIGINT        | NOT NULL                                                | Meal price in BDT/TK |
| `cut_token_before`  | TIME          | NOT NULL, DEFAULT `23:59`                               | Students must cut tokens before this time |
| `token_expires`     | TIME          | NOT NULL                                                | QR/token becomes invalid after this time on `meal_date` |
| `is_active`         | BOOLEAN       | NOT NULL, DEFAULT `true`                                | `false` means meal/token booking is disabled |
| `feast_note`        | VARCHAR(100)  | NULLABLE                                                | Optional special note (e.g. `"Eid Special"`) |
| `created_by`        | UUID          | NOT NULL                                                | UUID of the hall staff/admin who created the config |
| `updated_by`        | UUID          | NOT NULL                                                | UUID of the hall staff/admin who last updated the config |
| `created_by_name`   | VARCHAR(255)  | NOT NULL                                                | Snapshot of creator name at creation time |
| `updated_by_name`   | VARCHAR(255)  | NOT NULL                                                | Snapshot of last updater name |
| `created_at`        | TIMESTAMP     | NOT NULL, AUTO-SET                                      | Record creation timestamp |
| `updated_at`        | TIMESTAMP     | NOT NULL, AUTO-SET                                      | Last update timestamp |

### Unique Constraints

| Constraint Name | Columns |
|-----------------|---------|
| `uq_hall_meal_date_type` | (`hall_short_name`, `meal_date`, `meal_type`) |

### Join Table: `payment_meal_types`

Used by `Payment.mealTypes` (`@ElementCollection`).

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| `payment_id` | UUID | NOT NULL, FK to `payments.id` | Parent payment reference |
| `meal_type` | VARCHAR(20) | NOT NULL | Selected meal type |

---

# Table: `meal_tokens`

The `meal_tokens` table stores individual student meal bookings.  
Each row represents exactly one meal token for one student.
QR codes are generated only after payment verification.

| Column Name       | Type                     | Constraints                                | Description |
|-------------------|--------------------------|--------------------------------------------|-------------|
| `id`              | UUID                     | PRIMARY KEY, AUTO-GENERATED                | Unique token identifier |
| `payment_id`      | UUID                     | NOT NULL                                   | Linked payment identifier |
| `student_id`      | UUID                     | NOT NULL                                   | Student who booked the meal |
| `hall_short_name` | VARCHAR(255)             | NOT NULL                                   | Hall snapshot at booking time |
| `meal_date`       | DATE                     | NOT NULL                                   | Date the meal is for |
| `meal_type`       | ENUM (`MealType`)        | NOT NULL                                   | `LUNCH` or `DINNER` |
| `meal_price`      | BIGINT                   | NOT NULL                                   | Price snapshot at booking time |
| `token_status`    | ENUM (`TokenStatus`)     | NOT NULL, DEFAULT `PAYMENT_SUBMITTED`      | Current token state |
| `qr_code_data`    | TEXT                     | NULLABLE                                   | Signed QR payload / token data |
| `qr_generated_at` | TIMESTAMP                | NULLABLE                                   | QR generation timestamp |
| `scan_mode`       | ENUM (`ScanMode`)        | NULLABLE                                   | `STAFF_SCANNED` or `STUDENT_SCANNED` |
| `scanned_by_id`   | UUID                     | NULLABLE                                   | Staff UUID if scanned by hall staff |
| `used_at`         | TIMESTAMP                | NULLABLE                                   | Meal consumption timestamp |
| `created_at`      | TIMESTAMP                | NOT NULL, AUTO-SET                         | Token creation timestamp |
| `updated_at`      | TIMESTAMP                | NOT NULL, AUTO-SET                         | Last token update timestamp |


---

# Table: `payments`

The `payments` table stores submitted payment information from students.  
One payment may contain one or multiple meal types (`LUNCH`, `DINNER`) for the same date.

| Column Name        | Type                          | Constraints                                | Description |
|--------------------|-------------------------------|--------------------------------------------|-------------|
| `id`               | UUID                          | PRIMARY KEY, AUTO-GENERATED                | Unique payment identifier |
| `student_id`       | UUID                          | NOT NULL                                   | Student who submitted payment |
| `hall_short_name`  | VARCHAR(255)                  | NOT NULL                                   | Hall associated with the payment |
| `meal_date`        | DATE                          | NOT NULL                                   | Meal serving date |
| `meal_types`       | LIST<ENUM (`MealType`)>       | NOT NULL                                   | Selected meal types (`LUNCH`, `DINNER`) |
| `total_amount`     | BIGINT                        | NOT NULL                                   | Total payment amount |
| `payment_method`   | ENUM (`PaymentMethod`)        | NOT NULL                                   | `BKASH` or `NAGAD` |
| `sender_number`    | VARCHAR(20)                   | NOT NULL                                   | Student payment wallet number |
| `screenshot_url`   | TEXT                          | NULLABLE                                   | Uploaded payment proof image URL |
| `payment_status`   | ENUM (`PaymentStatus`)        | NOT NULL, DEFAULT `SUBMITTED`              | `SUBMITTED`, `VERIFIED`, `REJECTED` |
| `rejection_reason` | TEXT                          | NULLABLE                                   | Reason for rejection |
| `verified_by_name` | VARCHAR(100)                  | NULLABLE                                   | Snapshot of verifier name |
| `verified_at`      | TIMESTAMP                     | NULLABLE                                   | Verification timestamp |
| `submitted_at`     | TIMESTAMP                     | NOT NULL, AUTO-SET                         | Payment submission timestamp |

---



# Request DTO Documentation

# DTO: `CreateMealConfigRequest`

Used by hall admin/staff to create a new meal configuration.

## Validation Rules

| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| `mealDate` | `LocalDate` | `@NotNull`, `@Future` | Meal serving date |
| `mealType` | `MealType` | `@NotNull` | `LUNCH` or `DINNER` |
| `mealMenu` | `String` | `@NotBlank`, `@Size(max = 255)` | Meal menu description |
| `mealPrice` | `Long` | `@NotNull` | Meal price in BDT/TK |
| `cutTokenBefore` | `LocalTime` | `@NotNull` | Token booking deadline |
| `tokenExpires` | `LocalTime` | `@NotNull` | QR/token expiry time |
| `feastNote` | `String` | `@Size(max = 255)` | Optional special note |

---

# DTO: `UpdateMealConfigRequest`

Used by hall admin/staff to update an existing meal configuration.

| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| `mealMenu` | `String` | `@NotBlank`, `@Size(max = 255)` | Updated meal menu |
| `mealPrice` | `Long` | Optional | Updated meal price |
| `cutTokenBefore` | `LocalTime` | Optional | Updated token booking deadline |
| `tokenExpires` | `LocalTime` | Optional | Updated token expiry time |
| `isActive` | `Boolean` | Optional | Enable/disable meal booking |
| `feastNote` | `String` | `@Size(max = 255)` | Optional feast/special note |

---

# DTO: `CutTokenRequest`

Used by students to request meal token booking and submit payment information.

| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| `paymentMethod` | `PaymentMethod` | `@NotNull` | `BKASH` or `NAGAD` |
| `senderNumber` | `String` | `@NotBlank`, `@Pattern(^01[3-9]\\d{8}$)` | Student payment wallet number |
| `mealDate` | `LocalDate` | `@NotNull`, `@FutureOrPresent` | Requested meal date |
| `mealTypes` | `List<MealType>` | `@NotEmpty`, `@Size(max = 2)` | Selected meal types |
| `screenshotUrl` | `String` | Optional | Payment proof image URL |

---

# DTO: `ApprovePaymentRequest`

Used by hall admin/staff to approve a submitted payment.


| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| `paymentId` | `UUID` | `@NotNull` | Payment identifier to approve |

---

# DTO: `RejectPaymentRequest`

Used by hall admin/staff to reject a submitted payment.

| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| `paymentId` | `UUID` | `@NotNull` | Payment identifier to reject |
| `rejectionReason` | `String` | `@NotBlank`, `@Size(max = 255)` | Reason for rejection |

---

# Response DTO Documentation

---

# DTO: `MealConfigAdminResponse`

Returned to hall admin/staff when viewing detailed meal configuration information.

| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Unique meal configuration identifier |
| `hallShortName` | `String` | Hall short name |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealType` | `MealType` | `LUNCH` or `DINNER` |
| `mealMenu` | `String` | Meal menu description |
| `mealPrice` | `Long` | Meal price in BDT/TK |
| `cutTokenBefore` | `LocalTime` | Token booking deadline |
| `tokenExpires` | `LocalTime` | Token expiry time |
| `isActive` | `boolean` | Whether meal booking is active |
| `feastNote` | `String` | Optional feast/special note |
| `isBookingOpen` | `boolean` | Computed booking availability |
| `isTokenValid` | `boolean` | Computed token validity |
| `createdByName` | `String` | Snapshot of creator name |
| `updatedByName` | `String` | Snapshot of last updater name |
| `createdAt` | `LocalDateTime` | Record creation timestamp |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

---

# DTO: `MealConfigResponse`

Returned to students when viewing available meal configurations.


| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Meal configuration identifier |
| `hallShortName` | `String` | Hall short name |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealType` | `MealType` | `LUNCH` or `DINNER` |
| `mealMenu` | `String` | Meal menu |
| `mealPrice` | `Long` | Meal price |
| `cutTokenBefore` | `LocalTime` | Booking deadline |
| `tokenExpires` | `LocalTime` | Token expiry time |
| `isActive` | `boolean` | Whether booking is enabled |
| `feastNote` | `String` | Optional feast note |
| `isBookingOpen` | `boolean` | Computed booking availability |
| `createdAt` | `LocalDateTime` | Creation timestamp |

---

# DTO: `CutTokenResponse`

Returned after successful token cutting/payment submission.

| Field Name | Type | Description |
|------------|------|-------------|
| `paymentStatus` | `PaymentStatus` | Initial payment state |
| `submittedAt` | `LocalDateTime` | Payment submission timestamp |

---

# DTO: `MealTokenAdminResponse`

Returned when viewing detailed token information.

| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Meal token identifier |
| `paymentId` | `UUID` | Linked payment identifier |
| `hallShortName` | `String` | Hall short name snapshot |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealType` | `MealType` | `LUNCH` or `DINNER` |
| `mealPrice` | `Long` | Snapshot meal price |
| `mealMenu` | `String` | Snapshot meal menu |
| `tokenStatus` | `TokenStatus` | Current token state |
| `qrCodeData` | `String` | Signed QR payload |
| `qrGeneratedAt` | `LocalDateTime` | QR generation timestamp |
| `scanMode` | `ScanMode` | Token scan mode |
| `usedAt` | `LocalDateTime` | Meal consumption timestamp |
| `createdAt` | `LocalDateTime` | Token creation timestamp |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

---

# DTO: `MealTokenStudentResponse`

Returned to students when viewing their own token information.

| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Meal token identifier |
| `hallShortName` | `String` | Hall short name snapshot |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealType` | `MealType` | `LUNCH` or `DINNER` |
| `mealPrice` | `Long` | Snapshot meal price |
| `mealMenu` | `String` | Snapshot meal menu |
| `tokenStatus` | `TokenStatus` | Current token state |
| `qrCodeData` | `String` | Signed QR payload |
| `qrGeneratedAt` | `LocalDateTime` | QR generation timestamp |
| `scanMode` | `ScanMode` | Token scan mode |
| `usedAt` | `LocalDateTime` | Meal consumption timestamp |

---

# DTO: `PaymentAdminResponse`

Returned to admin/staff after payment verification actions.

| Field Name | Type | Description |
|------------|------|-------------|
| `verifiedByName` | `String` | Snapshot of verifier name |
| `verifiedAt` | `LocalDateTime` | Verification timestamp |

---

# DTO: `PaymentResponse`

Returned when viewing payment details.


| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Payment identifier |
| `studentId` | `UUID` | Student identifier |
| `hallShortName` | `String` | Hall short name |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealTypes` | `List<MealType>` | Selected meal types |
| `totalAmount` | `Long` | Total submitted amount |
| `paymentMethod` | `PaymentMethod` | `BKASH` or `NAGAD` |
| `senderNumber` | `String` | Student wallet number |
| `screenshotUrl` | `String` | Uploaded payment proof |
| `paymentStatus` | `PaymentStatus` | Current payment state |
| `rejectionReason` | `String` | Rejection explanation |
| `verifiedByName` | `String` | Snapshot of verifier name |
| `verifiedAt` | `LocalDateTime` | Verification timestamp |
| `submittedAt` | `LocalDateTime` | Submission timestamp |

---

# DTO: `HallMealSummaryResponse`

Returned when viewing hall-level meal summary statistics.

| Field Name | Type | Description |
|------------|------|-------------|
| `id` | `UUID` | Summary identifier |
| `hallShortName` | `String` | Hall short name |
| `mealDate` | `LocalDate` | Meal serving date |
| `mealType` | `MealType` | `LUNCH` or `DINNER` |
| `mealMenu` | `String` | Meal menu snapshot |
| `feastNote` | `String` | Optional feast note |
| `mealPrice` | `Long` | Meal price |
| `totalTokensSold` | `Long` | Total booked tokens |
| `totalTokensUsed` | `Long` | Total consumed tokens |
| `totalTokensUnused` | `Long` | Total unused tokens |
| `totalRevenue` | `Long` | Total revenue collected |
| `isFinalized` | `boolean` | Whether summary is finalized |
| `finalizedAt` | `LocalDateTime` | Finalization timestamp |
| `createdAt` | `LocalDateTime` | Creation timestamp |

---

# DTO: `StudentMealSummaryResponse`

Returned when viewing student-level meal summary statistics.

| Field Name | Type | Description |
|------------|------|-------------|
| `studentId` | `UUID` | Student identifier |
| `hallShortName` | `String` | Hall short name |
| `totalTokensPurchased` | `Long` | Total purchased tokens |
| `totalTokensUsed` | `Long` | Total consumed tokens |
| `totalTokensUnused` | `Long` | Total unused tokens |
| `totalSpent` | `Long` | Total amount paid |
| `updatedAt` | `LocalDateTime` | Last summary update timestamp |

