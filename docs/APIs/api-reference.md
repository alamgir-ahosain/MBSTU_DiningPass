# Hall Service API (v1)

| REST Method | URL Path                               | Role          | Description                                                                                                     |
| ----------- | -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| POST        | `/api/v1/halls`                        | SUPER_ADMIN   | Create a new hall in the system.                                                                                |
| PUT         | `/api/v1/halls/{id}`                   | SUPER_ADMIN   | Update all details for an existing hall.                                                                        |
| GET         | `/api/v1/halls`                        | AUTHENTICATED | Retrieve all halls (including inactive ones). Optional `activeOnly=true` parameter to filter active halls only. |
| GET         | `/api/v1/halls/{id}`                   | AUTHENTICATED | Fetch full details of a specific hall by UUID.                                                                  |
| GET         | `/api/v1/halls/short-name/{shortName}` | PUBLIC        | Find hall details using its unique short-code (e.g., MHH).                                                      |
| DELETE      | `/api/v1/halls/{id}`                   | SUPER_ADMIN   | Soft-delete a hall (deactivates it, sets `isActive = false`).                                                   |

---

# Student Service API (v1)

| REST Method | URL Path                    | Headers                                 | Description                                             |
| ----------- | --------------------------- | --------------------------------------- | ------------------------------------------------------- |
| POST        | `/api/v1/students/register` | None (Body: StudentRegistrationRequest) | Register a new student in the system.                   |
| GET         | `/api/v1/students/profile`  | `X-User-Id` (UUID)                      | Retrieve the authenticated student's profile.           |
| PUT         | `/api/v1/students/profile`  | `X-User-Id` (UUID)                      | Update the authenticated student's profile information. |

---

# Admin/Account Service API (v1)

| REST Method | URL Path                              | Headers                                  | Description                                    |
| ----------- | ------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| POST        | `/api/v1/admin/accounts`              | `X-User-Id`, `X-User-Role` (SUPER_ADMIN) | Create a new Admin or Staff account.           |
| GET         | `/api/v1/admin/accounts`              | `X-User-Role` (SUPER_ADMIN)              | Retrieve a list of all administrator accounts. |
| PUT         | `/api/v1/admin/accounts/{id}/suspend` | `X-User-Id` (SUPER_ADMIN)                | Suspend (soft delete) an admin account.        |

---
