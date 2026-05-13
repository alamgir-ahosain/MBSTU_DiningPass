# Request Response Reference
This document follows the same service order as `api-reference.md` and uses request/response + HTTP code format.
# 1. Auth Service API
## 1.1 Hall Associative Service API
### 1.1.1 Create Account
**POST** `/api/v1/admins`
**Request**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "HALL_ADMIN",
  "hallId": "uuid"
}
```
**Response - 201 Created**
```json
{
  "id": "uuid",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "HALL_ADMIN",
  "hallShortName": "string",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
}
```
**Errors**
- **400 Bad Request** - Validation error or duplicate account.
- **403 Forbidden** - Not allowed to create this role.
- **404 Not Found** - Hall not found.
### 1.1.2 Get Accounts
**GET** `/api/v1/admins?role=HALL_ADMIN&hallId=uuid`
**Request body:** none.
**Response - 200 OK**
```json
[
  {
    "id": "uuid",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "role": "HALL_ADMIN",
    "hallShortName": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
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
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "HALL_ADMIN",
  "hallShortName": "string",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
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
  "fullName": "string",
  "phone": "string"
}
```
**Response - 200 OK**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "HALL_ADMIN",
  "hallShortName": "string",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
}
```
**Errors**
- **400 Bad Request** - Validation error.
- **403 Forbidden** - Wrong role.
### 1.1.5 Suspend Account
**PATCH** `/api/v1/admins/{id}/status`
**Request body:** none.
**Response - 200 OK**
```json
{
  "message": "string",
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
  "studentId": "string",
  "fullName": "string",
  "email": "string",
  "password": "string",
  "hallShortName": "string",
  "roomNumber": "string",
  "department": "string",
  "gender": "MALE"
}
```
**Response - 201 Created**
```json
{
  "id": "uuid",
  "studentId": "string",
  "fullName": "string",
  "email": "string",
  "role": "STUDENT",
  "hallShortName": "string",
  "roomNumber": "string",
  "department": "string",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
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
  "studentId": "string",
  "fullName": "string",
  "email": "string",
  "role": "STUDENT",
  "hallShortName": "string",
  "roomNumber": "string",
  "department": "string",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
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
  "fullName": "string",
  "roomNumber": "string"
}
```
**Response - 200 OK**
```json
{
  "studentId": "string",
  "fullName": "string",
  "email": "string",
  "role": "STUDENT",
  "hallShortName": "string",
  "roomNumber": "string",
  "department": "string",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
}
```
**Errors**
- **400 Bad Request** - Validation error.
- **401 Unauthorized** - Missing or invalid token.
- **403 Forbidden** - Wrong role.
### 1.2.4 Get Students
**GET** `/api/v1/students?hallId=uuid&activeOnly=false`
**Request body:** none.
**Response - 200 OK**
```json
[
  {
    "id": "uuid",
    "studentId": "string",
    "fullName": "string",
    "email": "string",
    "role": "STUDENT",
    "hallShortName": "string",
    "roomNumber": "string",
    "department": "string",
    "gender": "MALE",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```
**Errors**
- **403 Forbidden** - Not allowed for this role.
### 1.2.5 Suspend Student
**PATCH** `/api/v1/students/{id}/status`
**Request body:** none.
**Response - 200 OK**
```json
{
  "message": "string",
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
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid"
}
```
**Response - 201 Created**
```json
{
  "id": "uuid",
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid",
  "isActive": true,
  "createdAt": "string"
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
    "id": "uuid",
    "fullName": "string",
    "shortName": "string",
    "genderType": "MALE",
    "bkashNumber": "string",
    "nagadNumber": "string",
    "hallAdminId": "uuid",
    "isActive": true,
    "createdAt": "string"
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
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid"
}
```
**Response - 200 OK**
```json
{
  "id": "uuid",
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid",
  "isActive": true,
  "createdAt": "string"
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
  "id": "uuid",
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid",
  "isActive": true,
  "createdAt": "string"
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
  "id": "uuid",
  "fullName": "string",
  "shortName": "string",
  "genderType": "MALE",
  "bkashNumber": "string",
  "nagadNumber": "string",
  "hallAdminId": "uuid",
  "isActive": true,
  "createdAt": "string"
}
```
**Errors**
- **403 Forbidden** - Not allowed for this role.
- **404 Not Found** - Hall not found.
### 1.3.6 Change Hall Status (Suspend / Activate)
**PATCH** `/api/v1/halls/{id}/status`
**Request**
```json
{
  "reason": "string"
}
```
The endpoint toggles the hall's active state: if the hall is currently active it will be suspended (isActive -> false); if already suspended it will be activated (isActive -> true). Only `SUPER_ADMIN` may call this endpoint.
**Response - 204 No Content**
**Errors**
- **403 Forbidden** - Only SUPER_ADMIN can change hall status.
- **404 Not Found** - Hall not found.
---
# 2. Meal Service API
## 2.1 Meal Config Service API
### 2.1.1 Create Meal Config
**POST** `/api/v1/meal-configs`
**Request**
```json
{
  "mealDate": "string",
  "mealType": "LUNCH",
  "mealMenu": "string",
  "mealPrice": 0,
  "cutTokenBefore": "string",
  "tokenExpires": "string",
  "feastNote": "string"
}
```
**Response - 201 Created**
```json
{
  "id": "uuid",
  "hallShortName": "string",
  "mealDate": "string",
  "mealType": "LUNCH",
  "mealMenu": "string",
  "mealPrice": 0,
  "cutTokenBefore": "string",
  "tokenExpires": "string",
  "isActive": true,
  "feastNote": "string",
  "isBookingOpen": true,
  "isTokenValid": true,
  "createdByName": "string",
  "updatedByName": "string",
  "createdAt": "string",
  "updatedAt": "string"
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
    "id": "uuid",
    "hallShortName": "string",
    "mealDate": "string",
    "mealType": "LUNCH",
    "mealMenu": "string",
    "mealPrice": 0,
    "cutTokenBefore": "string",
    "tokenExpires": "string",
    "isActive": true,
    "feastNote": "string",
    "isBookingOpen": true,
    "isTokenValid": true,
    "createdByName": "string",
    "updatedByName": "string",
    "createdAt": "string",
    "updatedAt": "string"
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
  "mealMenu": "string",
  "mealPrice": 0,
  "cutTokenBefore": "string",
  "tokenExpires": "string",
  "isActive": true,
  "feastNote": "string"
}
```
**Response - 200 OK**
```json
{
  "id": "uuid",
  "hallShortName": "string",
  "mealDate": "string",
  "mealType": "LUNCH",
  "mealMenu": "string",
  "mealPrice": 0,
  "cutTokenBefore": "string",
  "tokenExpires": "string",
  "isActive": true,
  "feastNote": "string",
  "isBookingOpen": true,
  "isTokenValid": true,
  "createdByName": "string",
  "updatedByName": "string",
  "createdAt": "string",
  "updatedAt": "string"
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
  "senderNumber": "string",
  "mealDate": "string",
  "mealTypes": ["LUNCH"],
  "screenshotUrl": "string"
}
```
**Response - 201 Created**
```json
{
  "paymentStatus": "SUBMITTED",
  "submittedAt": "string"
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
    "id": "uuid",
    "paymentId": "uuid",
    "hallShortName": "string",
    "mealDate": "string",
    "mealType": "LUNCH",
    "mealPrice": 0,
    "mealMenu": "string",
    "tokenStatus": "APPROVED",
    "qrCodeData": "string",
    "qrGeneratedAt": "string",
    "scanMode": "STAFF_SCANNED",
    "usedAt": "string",
    "createdAt": "string",
    "updatedAt": "string"
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
      "id": "uuid",
      "hallShortName": "string",
      "mealDate": "string",
      "paymentMethod": "BKASH",
      "senderNumber": "string",
      "receiverNumber": "string",
      "transactionId": "string",
      "totalAmount": 0,
      "screenshotUrl": "string",
      "paymentStatus": "SUBMITTED",
      "rejectionReason": "string",
      "verifiedAt": "string",
      "submittedAt": "string"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 0
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
  "verifiedByName": "string",
  "verifiedAt": "string"
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
  "timestamp": "string",
  "status": 0,
  "error": "string",
  "message": "string"
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
