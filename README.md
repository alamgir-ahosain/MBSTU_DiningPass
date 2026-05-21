# MBSTU DiningPass - Project Overview

MBSTU DiningPass is a mobile and web-enabled dining management platform for Mawlana Bhashani Science and Technology University (MBSTU). It digitizes the full hall meal lifecycle: student registration, meal booking, payment verification, QR-based meal collection, and hall-level reporting.

The system is designed for four operational roles:
- `STUDENT`
- `HALL_STAFF`
- `HALL_ADMIN`
- `SUPER_ADMIN`

---

## Deployment Links

- Web client (update with your production URL): `TBD`
- API gateway base URL (update with your production URL): `TBD`
- API references: `/docs/APIs/api-reference.md`
- Request/response examples: `/docs/APIs/request-response-reference.md`
- Database schema: `/docs/database/MODELS_SCHEMA.md`

---

## Core User Features

### 1) Secure Authentication and Role-Based Access
- Firebase-backed authentication with custom claims (`dbId`, `role`)
- Gateway-level token verification and trusted header forwarding
- Role-specific access across student, hall staff/admin, and super admin workflows

### 2) Digital Meal Booking and Payment Workflow
- Students cut meal tokens for available meal windows
- Payment proof submission for verification
- Hall staff/admin approval or rejection flow with auditable status transitions

### 3) QR-Based Meal Collection
- Signed QR token generation after payment verification
- Real-time staff scan validation
- One-time token consumption protection with Redis idempotency lock

---

## Other User Features

- Student profile management
- Student payment history and meal token history
- Hall-specific meal visibility for students
- Automatic hall-scoped authorization via profile lookup

---

## Admin Features

- Hall and hall-associate account management
- Meal configuration management (`LUNCH`, `DINNER`)
- Payment queue management (approve/reject)
- Real-time counter scan operations
- Hall meal summary analytics (sold/used/unused/revenue)
- Status control (activate/suspend) for halls and user accounts

---

## Platform and Runtime Features

- API Gateway with centralized authentication enforcement
- Microservice architecture with service boundaries by domain
- Redis caching and lock-based consistency helpers
- Scheduled cleanup and startup catch-up for meal/token lifecycle
- Feign-based service-to-service communication with forwarded auth headers

---

## System Design

### Tech Stack

| Part             | Technology |
|------------------|------------|
| Backend          | Spring Boot (microservices) |
| Frontend         | React (web), planned/optional mobile client integration |
| Database         | PostgreSQL |
| Cache/Lock       | Redis |
| API Security     | Firebase ID Token + API Gateway verification |
| Inter-Service    | OpenFeign |
| Build Tool       | Maven |
| Service Discovery| Eureka (scaffold present) |

---

## Backend Microservices

| Service | Purpose |
|---------|---------|
| `api-gateway` | Verifies Firebase token, injects trusted headers, routes requests |
| `auth-service` | Hall, student, and hall-associate account lifecycle and authorization data |
| `meal-service` | Meal config, token/payment lifecycle, QR scan, summaries, scheduler |
| `eureka-server` | Service discovery scaffold |
| `user-service` | Reserved scaffold for future domain expansion |

---

## Frontend Services

- **User Web Client** (`clients/user`): role-based dashboard and user operations
- **Admin Operations UI**: managed within role-based frontend routes

---

## Key Business Flow (High Level)

```mermaid
flowchart LR
    A[Student Registers] --> B[Firebase Login]
    B --> C[Gateway Verifies Token]
    C --> D[Student Cuts Token]
    D --> E[Payment Submitted]
    E --> F[Hall Staff/Admin Verifies Payment]
    F --> G[QR Generated]
    G --> H[Staff Scans QR]
    H --> I[Token Marked USED]
    I --> J[Hall Summary Updated]
    J --> K[Scheduler Finalizes No-Shows]
```

---


## Full Project Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Staff as Hall Staff/Admin
    participant Firebase
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Meal as Meal Service
    participant Redis
    participant DB as PostgreSQL

    alt New student registration
        Student->>Gateway: POST /api/v1/students
        Gateway->>Auth: Forward public request
        Auth->>DB: Validate hall/gender/duplicates
        Auth->>Firebase: createUser(email,password)
        Firebase-->>Auth: firebaseUid
        Auth->>DB: Save student
        Auth->>Firebase: setCustomUserClaims(dbId, role)
        Auth-->>Student: 201 Created
    end

    Student->>Firebase: Login (email/password)
    Firebase-->>Student: Firebase ID token

    Student->>Gateway: GET /api/v1/meal-configs + Bearer token
    Gateway->>Firebase: verifyIdToken
    Firebase-->>Gateway: claims(dbId, role, uid)
    Gateway->>Meal: Forward with X-User headers
    Meal->>Auth: getMyProfile() via Feign
    Auth-->>Meal: Student hall profile
    Meal-->>Student: Meal configs

    Student->>Gateway: POST /api/v1/meal-tokens
    Gateway->>Meal: Forward with X-User headers
    Meal->>Auth: getProfile() via Feign
    Auth-->>Meal: Hall-scoped student profile
    Meal->>DB: Validate booking and create payment SUBMITTED
    Meal-->>Student: CutTokenResponse

    Staff->>Gateway: GET /api/v1/payments
    Gateway->>Meal: Forward with X-User headers
    Meal->>Auth: getMyProfile() via Feign
    Auth-->>Meal: Staff/Admin hall profile
    Meal-->>Staff: Pending payment list

    alt Payment approved
        Staff->>Gateway: PATCH /api/v1/payments/:paymentId/approve
        Gateway->>Meal: Forward with X-User headers
        Meal->>DB: Create APPROVED meal token(s)
        Meal->>Meal: Generate signed QR JWT
        Meal->>DB: Save QR and mark payment VERIFIED
        Meal->>DB: Update hall summary sold/revenue
        Meal-->>Staff: Approval response
    else Payment rejected
        Staff->>Gateway: PATCH /api/v1/payments/:paymentId/reject
        Gateway->>Meal: Forward with X-User headers
        Meal->>DB: Mark payment REJECTED with reason
        Meal-->>Staff: Rejection response
    end

    Student->>Gateway: GET /api/v1/meal-tokens/my
    Gateway->>Meal: Forward with X-User headers
    Meal->>DB: Fetch APPROVED token(s)
    Meal-->>Student: Token list with QR

    Staff->>Gateway: POST /api/v1/meal-tokens/staff-scan
    Gateway->>Meal: Forward with X-User headers
    Meal->>Meal: Parse and validate QR JWT
    Meal->>Auth: getMyProfile() via Feign
    Auth-->>Meal: Staff hall profile
    Meal->>Redis: setIfAbsent(qr:used:tokenId)
    alt First valid scan
        Redis-->>Meal: Lock acquired
        Meal->>DB: Mark token USED
        Meal->>DB: Update hall summary used count
        Meal-->>Staff: VALID
    else Duplicate/invalid scan
        Redis-->>Meal: Lock exists or validation fails
        Meal-->>Staff: ALREADY_USED / INVALID
    end

    Note over Meal,DB: Scheduled jobs (15:00 lunch, 22:00 dinner, Asia/Dhaka)
    Meal->>DB: Cancel no-show APPROVED tokens as CANCELLED
    Meal->>DB: Update summary unused count and finalize
    Meal->>DB: Cleanup old tokens/payments/configs
```

--