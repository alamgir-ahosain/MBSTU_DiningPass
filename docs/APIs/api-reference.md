

#  Hall Admin & Hall Staff Service API (v1)

**Base path:** `/api/v1/admins`

| REST Method | URL Path       | Headers (Auth)             | Role Access                         | Description                                                                    |
| ----------- | -------------- | -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| POST        | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN             | Create account. SUPER_ADMIN can create any role, HALL_ADMIN → only HALL_STAFF. |
| GET         | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN, HALL_STAFF | Get accounts (filter: `role`, `hallId`). Access scope depends on role.         |
| GET         | `/{id}`        | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN, HALL_STAFF | Get by ID. SUPER_ADMIN = all, HALL_ADMIN = same hall, STAFF = self only.       |
| PATCH       | `/{id}/status` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN             | Suspend account. HALL_ADMIN limited to own hall.                               |

---

#  Student Service API (v1)

**Base path:** `/api/v1/students`

| REST Method | URL Path       | Headers (Auth)             | Role Access             | Description                                                  |
| ----------- | -------------- | -------------------------- | ----------------------- | ------------------------------------------------------------ |
| POST        | `/`            | None                       | PUBLIC                  | Register new student.                                        |
| GET         | `/me`          | `X-User-Id`, `X-User-Role` | STUDENT                 | Get own profile only.                                        |
| PUT         | `/me`          | `X-User-Id`, `X-User-Role` | STUDENT                 | Update own profile only.                                     |
| GET         | `/`            | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get students. SUPER_ADMIN = all, HALL_ADMIN = only own hall. |
| PATCH       | `/{id}/status` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Suspend student. HALL_ADMIN restricted to **own hall only**. |

---

#  Hall Service API (v1)

**Base path:** `/api/v1/halls`

| REST Method | URL Path             | Headers (Auth)             | Role Access             | Description                                         |
| ----------- | -------------------- | -------------------------- | ----------------------- | --------------------------------------------------- |
| POST        | `/`                  | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Create hall.                                        |
| GET         | `/`                  | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Get all halls (`activeOnly=true` optional).         |
| PUT         | `/{id}`              | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Update hall.                                        |
| GET         | `/{id}`              | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get hall by ID. HALL_ADMIN → only own hall.         |
| GET         | `/short-name/{name}` | `X-User-Id`, `X-User-Role` | SUPER_ADMIN, HALL_ADMIN | Get hall by short name. HALL_ADMIN → only own hall. |
| PATCH       | `/{id}/status`       | `X-User-Id`, `X-User-Role` | SUPER_ADMIN             | Suspend (soft delete) hall.                         |

---
