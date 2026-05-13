
# Auth Service API (v1)


## Hall Associative Service API (v1)

**Base path:** `/api/v1/admins`

| REST Method | URL Path       | Headers (Auth)             | Role Access                         | Description                                                                    |
|-------------|----------------|----------------------------|-------------------------------------|--------------------------------------------------------------------------------|
| POST        | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN             | Create account. SUPER_ADMIN can create any role, HALL_ADMIN → only HALL_STAFF. |
| GET         | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN, HALL_STAFF | Get accounts (filter: `role`, `hallId`). Access scope depends on role.         |
| GET         | `/me`          | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN, HALL_STAFF | Get own profile only.                                                          |
| PUT         | `/me`          | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF              | Update own profile only.                                                       |
| PATCH       | `/{id}/status` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN             | Toggle account status (suspend/activate). HALL_ADMIN limited to own hall.     |
| GET         | `/count`       | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF              | Get all active hall staff and hall_admin(SUPER_ADMIN) ,HALL_ADMIN find all.    |

---

##  Student Service API (v1)

**Base path:** `/api/v1/students`

| REST Method | URL Path       | Headers (Auth)             | Role Access             | Description                                                                 |
| ----------- | -------------- | -------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| POST        | `/`            | None                       | PUBLIC                  | Register new student.                                                       |
| GET         | `/me`          | `X-User-Id`, `X-User-Role` | STUDENT                 | Get own profile only.                                                       |
| PUT         | `/me`          | `X-User-Id`, `X-User-Role` | STUDENT                 | Update own profile only.                                                    |
| GET         | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get students as a paged response (`page`, `size`). SUPER_ADMIN = all, HALL_ADMIN = only own hall. |
| PATCH       | `/{id}/status` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Toggle student status (suspend/activate). HALL_ADMIN restricted to **own hall only**. |

---
**Errors**
- **400 Bad Request** - Missing or invalid fields.
- **401 Unauthorized** - Invalid email or password.

---

##  Hall Service API (v1)

**Base path:** `/api/v1/halls`

| REST Method | URL Path             | Headers (Auth)             | Role Access             | Description                                         |
|-------------|----------------------| -------------------------- | ----------------------- |-----------------------------------------------------|
| POST        | `/`                  | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Create hall.                                        |
| GET         | `/`                  | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Get all halls (`activeOnly=true` optional).         |
| PUT         | `/{id}`              | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Update hall.                                        |
| GET         | `/{id}`              | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get hall by ID. HALL_ADMIN → only own hall.         |
| GET         | `/short-name/{name}` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get hall by short name. HALL_ADMIN → only own hall. |
| PATCH       | `/{id}/status`       | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Suspend (soft delete) hall.                         |
| GET         | `/count`             | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Count all active hall.                              |

---

# Meal Service API (v1)


## Meal Config Service API (v1)

**Base path:** `/api/v1/meal-configs`

| REST Method | URL Path     | Headers (Auth)             | Role Access                  | Description |
|-------------|--------------|----------------------------|------------------------------|-------------|
| GET         | `/test`      | None                       | PUBLIC                       | Health/test endpoint for the meal-config controller. |
| POST        | `/`          | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF       | Create a meal configuration for a hall meal/date. |
| GET         | `/`          | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF       | Get all meal configurations accessible to requester. |
| PUT         | `/{configId}`| `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF       | Update an existing meal configuration. |

---


## Meal Token Service API (v1)

**Base path:** `/api/v1/meal-tokens`

| REST Method | URL Path | Headers (Auth)             | Role Access | Description |
|-------------|----------|----------------------------|--------------|-------------|
| GET         | `/test`  | None                       | PUBLIC       | Health/test endpoint for the meal-token controller. |
| POST        | `/`      | `X-User-Id`, `X-User-Role` | STUDENT      | Cut/book meal token and submit payment information. |
| GET         | `/my`    | `X-User-Id`, `X-User-Role` | STUDENT      | Get own approved meal tokens. |

---

## Payment Service API (v1)

**Base path:** `/api/v1/payments`

| REST Method | URL Path         | Headers (Auth)             | Role Access                  | Description |
|-------------|------------------|----------------------------|------------------------------|-------------|
| GET         | `/`              | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF       | Get payments with pagination (`page`, `size`). |
| PATCH       | `/{id}/approve`  | `X-User-Id`, `X-User-Role` | HALL_ADMIN, HALL_STAFF       | Approve payment and generate QR meal tokens. |
| GET         | `/test`          | None                       | PUBLIC                       | Health/test endpoint for the payment controller. |

