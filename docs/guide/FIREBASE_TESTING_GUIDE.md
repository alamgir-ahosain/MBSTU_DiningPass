# Firebase Testing Setup Guide

## 🚀 Quick Start

### 1. Configure Firebase Credentials

**Step 1:** Get your Firebase config from Firebase Console

- Go to: **Firebase Console** → **Project Settings** → **General** → **Your apps** → **Web app**
- Copy the config object

**Step 2:** Update `clients/user/src/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**Step 3:** Update `clients/user/src/FirebaseTestApp.jsx` (same config)

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

### 2. Install Dependencies

```bash
cd clients/user
npm install
```

This installs:

- `firebase` - Firebase SDK for web
- `axios` - HTTP client for API calls
- All other React dependencies

---

### 3. Start the Auth Service Backend

```bash
# Terminal 1
cd services/auth-service
mvn spring-boot:run
```

The service starts on `http://localhost:8081`

**Ensure:**

-  PostgreSQL database is running
-  `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable is set
-  No port conflicts

---

### 4. Start the Frontend Dev Server

```bash
# Terminal 2
cd clients/user
npm run dev
```

The frontend starts on `http://localhost:5173` (or similar)

---

### 5. Create a Hall (Required for Student Registration)

**Option A: Using cURL**

```bash
curl -X POST http://localhost:8081/api/v1/halls \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jahangirnagar Muslim Hall",
    "shortName": "JAMH",
    "genderType": "MALE",
    "capacity": 250
  }'
```

**Response:**

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "capacity": 250,
  "isActive": true
}
```

**Option B: Using Postman**

- POST `http://localhost:8081/api/v1/halls`
- Body (JSON):

```json
{
  "fullName": "Jahangirnagar Muslim Hall",
  "shortName": "JAMH",
  "genderType": "MALE",
  "capacity": 250
}
```

**Copy the `id` from the response** - you'll need this for registration!

---

##  Testing Flow

### Step 1: Open the Test UI

Navigate to: `http://localhost:5173`

You'll see the **Firebase Auth Test Panel** with 7 sections.

---

### Step 2: Register a Student

**In the "1️⃣ Register Student" section:**

1. Fill in the form:
   - Student ID: `2021-1-60-011`
   - Full Name: `Rahim Uddin`
   - Email: `rahim@mbstu.ac.bd`
   - Password: `mySecret99`
   - **Hall ID: (paste the UUID from Step 1)**
   - Room Number: `201`
   - Department: `CSE`
   - Gender: `MALE`

2. Click **Register** button

3. **Success Response:**

```json
{
  "id": "student-uuid",
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "role": "STUDENT",
  "hallId": "hall-uuid",
  "roomNumber": "201",
  "department": "CSE",
  "gender": "MALE"
}
```

**If it fails:**

-  Hall ID doesn't exist → Create a hall first
-  Email already exists → Use a different email
-  Gender mismatch → Select correct gender for hall
-  Backend not running → Start auth-service on port 8081

---

### Step 3: Login

**In the "2️⃣ Login" section:**

1. Use the same credentials:
   - Email: `rahim@mbstu.ac.bd`
   - Password: `mySecret99`

2. Click **Login** button

3. **Success Response:**

```json
{
  "uid": "firebase-user-id",
  "email": "rahim@mbstu.ac.bd",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**UI Update:**

- The green status bar shows:  Logged in as rahim@mbstu.ac.bd
- Sections 3-7 become available

---

### Step 4: Get Student Profile

**In the "3️⃣ Get Profile" section** (only available after login):

1. Click **Get Profile** button

2. **Success Response:**

```json
{
  "id": "student-uuid",
  "studentId": "2021-1-60-011",
  "fullName": "Rahim Uddin",
  "email": "rahim@mbstu.ac.bd",
  "role": "STUDENT",
  "hallId": "hall-uuid",
  "roomNumber": "201",
  "department": "CSE",
  "gender": "MALE"
}
```

**This confirms:**

-  Firebase token is valid
- Backend can verify the token
-  Student record exists in database

---

### Step 5: Change Password

**In the "5️⃣ Change Password" section** (only available after login):

1. Enter credentials:
   - Current Password: `mySecret99`
   - New Password: `newPass88!`

2. Click **Change Password**

3. **Success Response:**

```json
{
  "message": "Password changed successfully"
}
```

4. **Now login again with NEW password:**
   - Email: `rahim@mbstu.ac.bd`
   - Password: `newPass88!`

---

### Step 6: Test Multiple Registrations

**Change email & try again** (to test duplicate prevention):

Try registering with:

- Email: `rahim2@mbstu.ac.bd` (new)
- Student ID: `2021-1-60-012` (new)
- Same hall, department, etc.

This confirms the backend properly validates duplicates.

---

### Step 7: Forgot Password

**In the "4️⃣ Forgot Password" section:**

1. Enter your email: `rahim@mbstu.ac.bd`
2. Click **Send Reset Email**

**Success Response:**

```json
{
  "message": "Password reset email sent to rahim@mbstu.ac.bd"
}
```

**Note:** The email won't actually send in development unless you configure a real email provider in Firebase. But the API call succeeds, meaning Firebase received the request.

---

### Step 8: Logout

**In the "6️⃣ Logout" section:**

1. Click **Logout** button

**Success Response:**

```json
{
  "message": "Logged out successfully"
}
```

**UI Update:**

- Status bar shows:  Not logged in
- Sections 3-7 disappear

---

##  Troubleshooting

### Problem: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

- Auth-service needs CORS configuration
- Add to `SecurityConfig.java`:

```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

---

### Problem: Firebase Config Error

```
Firebase SDK not initialized or invalid config
```

**Solution:**

- Check if config values are correct in `firebase.js`
- Ensure `apiKey` is not the placeholder value
- Verify project ID matches Firebase Console

---

### Problem: "Hall not found"

```
{
  "message": "Hall not found with ID: xxx"
}
```

**Solution:**

- The Hall UUID doesn't exist
- Get valid hall ID: `GET http://localhost:8081/api/v1/halls`
- Use that UUID in registration

---

### Problem: Network Error / Backend Unreachable

```
Cannot connect to localhost:8081
```

**Solution:**

- Check if auth-service is running: `ps aux | grep java`
- Check if port 8081 is in use: `lsof -i :8081`
- Restart the service: `mvn spring-boot:run`

---

### Problem: Database Connection Error

```
Unable to get a connection, pool error Timeout waiting for idle object
```

**Solution:**

- PostgreSQL is not running
- Check connection string in `application.yml`
- Verify `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` env vars

---

### Problem: Firebase Custom Claims Not Set

```
Backend returns custom claims but they're not in the token
```

**Solution:**

- Logout and login again
- Firebase caches claims; re-login fetches fresh token
- Or refresh token manually using Step 7️⃣

---



## 🔍 Backend Logs to Watch

**Successful Registration:**

```
Student registering: 2021-1-60-011
Firebase user created: firebase-uid-abc123
Student saved in DB: db-uuid
Custom claims set for Firebase user: firebase-uid-abc123
```

**Duplicate Email Error:**

```
Student with email rahim@mbstu.ac.bd already exists
```

**Login (at Frontend only):**

```
No logs in backend — Firebase handles it
```

**Get Profile:**

```
Fetching student profile for user ID: db-uuid
```

