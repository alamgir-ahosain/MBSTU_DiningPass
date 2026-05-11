# Request Response Reference

This document follows the same service order as `api-reference.md` and uses request/response + HTTP code format.

# 1. Auth Service API

## 1.1 Hall Associative Service API

### 1.1.1 Create Account
**POST** `/api/v1/admins`

**Request**
```json
{
  "fullName": "Alamgir Hosain",
  "email": "admin@mbstu.ac.bd",
  "password": "secret123",
  "phone": "01712345678",
  "role": "HALL_ADMIN",
  "hallShortName": "JAMH"
}
```

**Response - 201 Created**
```json
{
  "id": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
  "fullName": "Alamgir Hosain",
  "email": "admin@mbstu.ac.bd",
  "phone": "01712345678",
  "role": "HALL_ADMIN",
  "hallShortName": "JAMH",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error or duplicate account.
- **403 Forbidden** - Not allowed to create this role.
- **404 Not Found** - Hall not found.

### 1.1.2 Get Accounts
**GET** `/api/v1/admins?role=HALL_ADMIN&hallId={uuid}`

**Request body:** none.

**Response - 200 OK**
```json
[
  {
    "id": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
    "fullName": "Alamgir Hosain",
    "email": "admin@mbstu.ac.bd",
    "phone": "01712345678",
    "role": "HALL_ADMIN",
    "hallShortName": "JAMH",
    "isActive": true,
    "createdAt": "2026-05-11T10:30:00",
    "updatedAt": "2026-05-11T10:30:00"
  }
]
```

**Errors**
- **403 Forbidden** - Not allowed for this role.

### 1.1.3 Get My Profile
**GET** `/api/v1/admins/me`

**Request body:** none.

**Response - 200 OK**
```json
{
  "fullName": "Alamgir Hosain",
  "email": "admin@mbstu.ac.bd",
  "phone": "01712345678",
  "role": "HALL_ADMIN",
  "hallShortName": "JAMH",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Profile not found.

### 1.1.4 Update My Profile
**PUT** `/api/v1/admins/me`

**Request**
```json
{
  "fullName": "Alamgir H.",
  "phone": "01711111111"
}
```

**Response - 200 OK**
```json
{
  "fullName": "Alamgir H.",
  "email": "admin@mbstu.ac.bd",
  "phone": "01711111111",
  "role": "HALL_ADMIN",
  "hallShortName": "JAMH",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:45:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Wrong role.

### 1.1.5 Suspend Account
**PATCH** `/api/v1/admins/{id}/status`

**Request**
```json
{
  "reason": "Policy violation"
}
```

**Response - 200 OK**
```json
{
  "message": "Account suspended successfully",
  "success": true
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Target account not found.

---

## 1.2 Student Service API

### 1.2.1 Register Student
**POST** `/api/v1/students`

**Request**
```json
{
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "password": "mySecret99",
  "hallShortName": "JAMH",
  "roomNumber": "201",
  "department": "CSE",
  "gender": "MALE"
}
```

**Response - 201 Created**
```json
{
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "role": "STUDENT",
  "hallShortName": "JAMH",
  "roomNumber": "201",
  "department": "CSE",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error or duplicate student/email.
- **404 Not Found** - Hall not found.
- **500 Internal Server Error** - Unexpected server error.

### 1.2.2 Get My Profile
**GET** `/api/v1/students/me`

**Request body:** none.

**Response - 200 OK**
```json
{
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "role": "STUDENT",
  "hallShortName": "JAMH",
  "roomNumber": "201",
  "department": "CSE",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **401 Unauthorized** - Missing or invalid token.
- **403 Forbidden** - Wrong role.

### 1.2.3 Update My Profile
**PUT** `/api/v1/students/me`

**Request**
```json
{
  "fullName": "Rahim Uddin",
  "roomNumber": "202"
}
```

**Response - 200 OK**
```json
{
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "role": "STUDENT",
  "hallShortName": "JAMH",
  "roomNumber": "202",
  "department": "CSE",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:45:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **401 Unauthorized** - Missing or invalid token.
- **403 Forbidden** - Wrong role.

### 1.2.4 Get Students
**GET** `/api/v1/students?hallId={uuid}&activeOnly=false`

**Request body:** none.

**Response - 200 OK**
```json
[
  {
    "studentId": "2021-1-60-011",
    "fullName": "Rahim Uddin",
    "email": "rahim@mbstu.ac.bd",
    "role": "STUDENT",
    "hallShortName": "JAMH",
    "roomNumber": "202",
    "department": "CSE",
    "gender": "MALE",
    "isActive": true,
    "createdAt": "2026-05-11T10:30:00",
    "updatedAt": "2026-05-11T10:45:00"
  }
]
```

**Errors**
- **403 Forbidden** - Not allowed for this role.

### 1.2.5 Suspend Student
**PATCH** `/api/v1/students/{id}/status`

**Request**
```json
{
  "reason": "Long-term leave"
}
```

**Response - 200 OK**
```json
{
  "message": "Student suspended successfully",
  "success": true
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Student not found.

---

## 1.3 Hall Service API

### 1.3.1 Create Hall
**POST** `/api/v1/halls`

**Request**
```json
{
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000000",
  "nagadNumber": "01800000000",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1"
}
```

**Response - 201 Created**
```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000000",
  "nagadNumber": "01800000000",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Only SUPER_ADMIN can create halls.

### 1.3.2 Get All Halls
**GET** `/api/v1/halls?activeOnly=false`

**Request body:** none.

**Response - 200 OK**
```json
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "fullName": "Jahangirnagar Muslim Hall",
    "shortName": "JAMH",
    "genderType": "MALE",
    "bkashNumber": "01700000000",
    "nagadNumber": "01800000000",
    "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
    "isActive": true,
    "createdAt": "2026-05-11T10:30:00"
  }
]
```

**Errors**
- **403 Forbidden** - Only SUPER_ADMIN can access this route.

### 1.3.3 Update Hall
**PUT** `/api/v1/halls/{id}`

**Request**
```json
{
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000001",
  "nagadNumber": "01800000001",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1"
}
```

**Response - 200 OK**
```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000001",
  "nagadNumber": "01800000001",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Only SUPER_ADMIN can update halls.
- **404 Not Found** - Hall not found.

### 1.3.4 Get Hall By ID
**GET** `/api/v1/halls/{id}`

**Request body:** none.

**Response - 200 OK**
```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000001",
  "nagadNumber": "01800000001",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Hall not found.

### 1.3.5 Get Hall By Short Name
**GET** `/api/v1/halls/short-name/{name}`

**Request body:** none.

**Response - 200 OK**
```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "bkashNumber": "01700000001",
  "nagadNumber": "01800000001",
  "hallAdminId": "c6f4d5d3-2e2f-4f17-bd62-3f0e8c59d9a1",
  "isActive": true,
  "createdAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Hall not found.

### 1.3.6 Suspend Hall
**PATCH** `/api/v1/halls/{id}/status`

**Request body:** none.

**Response - 204 No Content**

**Errors**
- **403 Forbidden** - Only SUPER_ADMIN can suspend halls.
- **404 Not Found** - Hall not found.

---

# 2. Meal Service API

## 2.1 Meal Config Service API

### 2.1.1 Create Meal Config
**POST** `/api/v1/meal-configs`

**Request**
```json
{
  "mealDate": "2026-05-15",
  "mealType": "LUNCH",
  "mealMenu": "Rice, Fish Curry, Dal, Salad",
  "mealPrice": 45,
  "cutTokenBefore": "10:00:00",
  "tokenExpires": "14:00:00",
  "feastNote": "Special lunch"
}
```

**Response - 201 Created**
```json
{
  "id": "b3d05c68-6fb8-4f12-b8ce-6f1f0f2dc2d1",
  "hallShortName": "JAMH",
  "mealDate": "2026-05-15",
  "mealType": "LUNCH",
  "mealMenu": "Rice, Fish Curry, Dal, Salad",
  "mealPrice": 45,
  "cutTokenBefore": "10:00:00",
  "tokenExpires": "14:00:00",
  "isActive": true,
  "feastNote": "Special lunch",
  "isBookingOpen": true,
  "isTokenValid": true,
  "createdByName": "Alamgir Hosain",
  "updatedByName": "Alamgir Hosain",
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error or duplicate meal config.
- **403 Forbidden** - Not allowed for this role.

### 2.1.2 Get Meal Configs
**GET** `/api/v1/meal-configs`

**Request body:** none.

**Response - 200 OK**
```json
[
  {
    "id": "b3d05c68-6fb8-4f12-b8ce-6f1f0f2dc2d1",
    "hallShortName": "JAMH",
    "mealDate": "2026-05-15",
    "mealType": "LUNCH",
    "mealMenu": "Rice, Fish Curry, Dal, Salad",
    "mealPrice": 45,
    "cutTokenBefore": "10:00:00",
    "tokenExpires": "14:00:00",
    "isActive": true,
    "feastNote": "Special lunch",
    "isBookingOpen": true,
    "isTokenValid": true,
    "createdByName": "Alamgir Hosain",
    "updatedByName": "Alamgir Hosain",
    "createdAt": "2026-05-11T10:30:00",
    "updatedAt": "2026-05-11T10:30:00"
  }
]
```

**Errors**
- **403 Forbidden** - Not allowed for this role.

### 2.1.3 Update Meal Config
**PUT** `/api/v1/meal-configs/{configId}`

**Request**
```json
{
  "mealMenu": "Rice, Beef Curry, Dal, Salad",
  "mealPrice": 50,
  "cutTokenBefore": "10:30:00",
  "tokenExpires": "14:30:00",
  "isActive": true,
  "feastNote": "Updated menu"
}
```

**Response - 200 OK**
```json
{
  "id": "b3d05c68-6fb8-4f12-b8ce-6f1f0f2dc2d1",
  "hallShortName": "JAMH",
  "mealDate": "2026-05-15",
  "mealType": "LUNCH",
  "mealMenu": "Rice, Beef Curry, Dal, Salad",
  "mealPrice": 50,
  "cutTokenBefore": "10:30:00",
  "tokenExpires": "14:30:00",
  "isActive": true,
  "feastNote": "Updated menu",
  "isBookingOpen": true,
  "isTokenValid": true,
  "createdByName": "Alamgir Hosain",
  "updatedByName": "Alamgir Hosain",
  "createdAt": "2026-05-11T10:30:00",
  "updatedAt": "2026-05-11T10:45:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **404 Not Found** - Meal config not found.
- **403 Forbidden** - Not allowed for this role.

---

## 2.2 Meal Token Service API

### 2.2.1 Cut/Book Meal Token
**POST** `/api/v1/meal-tokens`

**Request**
```json
{
  "paymentMethod": "BKASH",
  "senderNumber": "01712345678",
  "mealDate": "2026-05-15",
  "mealTypes": ["LUNCH"],
  "screenshotUrl": "https://storage.example.com/payments/screenshot_001.jpg"
}
```

**Response - 201 Created**
```json
{
  "paymentStatus": "SUBMITTED",
  "submittedAt": "2026-05-11T10:30:00"
}
```

**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Only STUDENT can cut a token.

### 2.2.2 Get My Meal Tokens
**GET** `/api/v1/meal-tokens/my`

**Request body:** none.

**Response - 200 OK**
```json
[
  {
    "id": "9f6f5d1b-8e47-4b16-8a32-3ac77e0a4aa1",
    "hallShortName": "JAMH",
    "mealDate": "2026-05-15",
    "mealType": "LUNCH",
    "mealPrice": 45,
    "mealMenu": "Rice, Fish Curry, Dal, Salad",
    "tokenStatus": "APPROVED",
    "qrCodeData": "QR-STRING-OR-BASE64-DATA",
    "qrGeneratedAt": "2026-05-11T11:00:00",
    "scanMode": null,
    "usedAt": null
  }
]
```

**Errors**
- **401 Unauthorized** - Missing or invalid token.
- **403 Forbidden** - Only STUDENT can access this route.

---

## 2.3 Payment Service API

### 2.3.1 Get Payments
**GET** `/api/v1/payments?page=0&size=20`

**Request body:** none.

**Response - 200 OK**
```json
{
  "content": [
    {
      "id": "d3c6d7f6-7a1d-4f07-8bc3-3aefcb1fd9f1",
      "studentId": "e9b2d6f4-5c3a-4f16-90b7-2f2a0aa1d0a1",
      "hallShortName": "JAMH",
      "mealDate": "2026-05-15",
      "mealTypes": ["LUNCH"],
      "totalAmount": 45,
      "paymentMethod": "BKASH",
      "senderNumber": "01712345678",
      "screenshotUrl": "https://storage.example.com/payments/screenshot_001.jpg",
      "paymentStatus": "SUBMITTED",
      "rejectionReason": null,
      "verifiedByName": null,
      "verifiedAt": null,
      "submittedAt": "2026-05-11T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  }
}
```

**Errors**
- **401 Unauthorized** - Missing or invalid token.
- **403 Forbidden** - Only HALL_ADMIN and HALL_STAFF can access.

### 2.3.2 Approve Payment
**PATCH** `/api/v1/payments/{id}/approve`

**Request body:** none.

**Response - 200 OK**
```json
{
  "verifiedByName": "Alamgir Hosain",
  "verifiedAt": "2026-05-11T11:15:00"
}
```

**Errors**
- **400 Bad Request** - Invalid payment state.
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Payment not found.

---

## 3. Shared Error Response

When the backend returns an error, it uses the following JSON shape:

```json
{
  "timestamp": "2026-05-11T11:15:00",
  "status": 400,
  "error": "Validation Error",
  "message": "email: Invalid email format"
}
```

---

## 4. Enum Reference

### `MealType`
```json
["LUNCH", "DINNER"]
```

### `PaymentMethod`
```json
["BKASH", "NAGAD"]
```

---

## 5. Quick Header Reminder

For protected requests, include:

```text
X-User-Id:   <uuid>
X-User-Role: <role>
Content-Type: application/json
```

Roles used by the project:
- `STUDENT`
- `HALL_ADMIN`
- `HALL_STAFF`
- `SUPER_ADMIN`

