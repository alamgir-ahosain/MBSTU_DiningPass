# MBSTU DiningPass

MBSTU DiningPass is a web-enabled dining management platform for **Mawlana Bhashani Science and Technology University (MBSTU)**. It digitizes hall dining; replacing manual token/coupon systems with a role-based, real-time platform. <br>

---
> Live web application - [https://mbstudiningpass.netlify.app](https://mbstudiningpass.netlify.app) <br>


---
## Deployment Links

- Live web application - [https://mbstudiningpass.netlify.app](https://mbstudiningpass.netlify.app)
- API documentation - [API Reference](/docs/APIs/api-reference.md),  [API Request Response](/docs/APIs/request-response-reference.md)
- Database schema - [Models Schema](/docs/database/MODELS_SCHEMA.md)
- Guide - [Frontend Guide](/docs/guide/FRONTEND_GUIDE.md), [Full Guide Here](/docs/guide/FULL_GUIDE_HERE.md)
---

## Core User Features (Student)

- **Meal Booking (Cut Token):** Students pick a meal date and select Lunch and/or Dinner, then pay through **bKash** directly from the app.

- **Automatic QR Token Issuance:** Once a payment is verified, a signed QR token is generated automatically - no manual coupon collection required.

- **My Tokens :** Students can view their active tokens with meal date, menu, and expiry time, and present the QR code at the counter.



## Hall Staff Features

- Scan student QR tokens at the counter (camera or manual paste) to redeem a meal
- View and manage meal configurations (menu, price, cut-off time, expiry)
- View real-time hall meal summaries (sold, used, unused, revenue)

## Hall Admin Features

- Everything Hall Staff can do, scoped to their hall
- Manage hall staff accounts (create, suspend/activate)
- Manage student records within their hall

## Super Admin Features

- Manage halls across the university (create, update, suspend/activate)
- Manage hall admin accounts
- View and manage students across all halls

---

# System Design

## Tech Stack

| Part | Technology |
|---|---|
| Backend | Spring Boot microservices |
| Frontend | React + Vite |
| Database | PostgreSQL |
| Cache / Lock | Redis (with in-memory fallback) |
| Authentication | Firebase ID Token + API Gateway verification |
| Service-to-service | OpenFeign |
| Payment Gateway | bKash |
| Build Tool | Maven |
| Deployment | Render (backend), Netlify (frontend) |



## Backend Microservices

| Service | Purpose |
|---|---|
| **api-gateway** | Verifies Firebase ID tokens and forwards trusted user headers  downstream |
| **auth-service** | Manages hall, student, and hall-associate (admin/staff) identities |
| **meal-service** | Handles meal configs, bKash payments, meal tokens, QR scan/validation, and hall summaries |




## Frontend Services

- **Web Application**: For students to book meals and for admins to manage the system



## Database Schema

- The system uses **PostgreSQL** as its primary datastore.
-  Each microservice independently maintains its own database and tables. Details of the database schema can be found here:  [Database Schema](/docs/database/MODELS_SCHEMA.md)




---

# Conclusion

MBSTU DiningPass replaces manual dining coupons with a fully digital, role-based platform - covering booking, payment, QR-based redemption, and hall-level reporting in one system. It's designed to make dining hall management transparent and effortless for students, hall staff, hall admins, and university-wide super admins alike.