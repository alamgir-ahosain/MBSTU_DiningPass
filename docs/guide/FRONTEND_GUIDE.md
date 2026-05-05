# MBSTU Dining Pass - Frontend Working Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Core Systems](#core-systems)
5. [Authentication Flow](#authentication-flow)
6. [Role-Based Access Control](#role-based-access-control)
7. [API Integration](#api-integration)
8. [Component Guide](#component-guide)
9. [Routing](#routing)
10. [Styling](#styling)
11. [State Management](#state-management)
12. [Development Workflow](#development-workflow)
13. [Environment Configuration](#environment-configuration)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

The MBSTU Dining Pass frontend is a React 19 application built with Vite, featuring role-based access control, Firebase authentication, and a modern UI. The application supports four user roles, each with dedicated pages and functionalities.

**Technology Stack:**

- React 19.2.5 (UI Framework)
- Vite 8.0.10 (Build Tool)
- React Router DOM (Routing)
- Firebase 11.2.0 (Authentication)
- Axios 1.7.7 (HTTP Client)
- CSS3 (Styling)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Browser / Client                 │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Vite Dev  │
        │   Server    │
        └──────┬──────┘
               │
        ┌──────▼────────────┐
        │   React Router    │
        │   (BrowserRouter) │
        └──────┬────────────┘
               │
        ┌──────▼────────────┐
        │   AuthProvider    │
        │   (Context)       │
        └──────┬────────────┘
               │
        ┌──────▼────────────────────┐
        │   Protected Routes        │
        │   (ProtectedRoute)         │
        └──────┬────────────────────┘
               │
        ┌──────▼────────────────────┐
        │   Components              │
        │   - Pages                 │
        │   - Forms                 │
        │   - Lists                 │
        └──────┬────────────────────┘
               │
        ┌──────▼────────────────────┐
        │   API Layer               │
        │   (apiClient + api.js)     │
        └──────┬────────────────────┘
               │
        ┌──────▼────────────────────┐
        │   Firebase Auth           │
        │   & Backend API           │
        └──────────────────────────┘
```

### Data Flow

1. User navigates to page
2. ProtectedRoute checks authentication status
3. AuthContext provides user data and role
4. Component renders based on role
5. Component calls API methods from services/api.js
6. API client (apiClient.js) attaches Firebase token
7. Request goes to backend with Authorization header
8. Response updates component state
9. Component re-renders with new data

---

## Folder Structure

```
clients/user/
├── src/
│   ├── pages/                    # Page components by role
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegistrationPage.jsx
│   │   ├── Student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── ViewProfile.jsx
│   │   │   └── ChangePassword.jsx
│   │   ├── HallAdmin/
│   │   │   ├── HallAdminDashboard.jsx
│   │   │   ├── CreateHallStaff.jsx
│   │   │   ├── HallAdminStaffList.jsx
│   │   │   └── HallAdminStudents.jsx
│   │   ├── HallStaff/
│   │   │   ├── HallStaffDashboard.jsx
│   │   │   ├── HallStaffStudents.jsx
│   │   │   └── IssueToken.jsx
│   │   └── SuperAdmin/
│   │       ├── SuperAdminDashboard.jsx
│   │       ├── CreateHall.jsx
│   │       ├── SuperAdminHalls.jsx
│   │       ├── SuperAdminAdmins.jsx
│   │       └── SuperAdminStudents.jsx
│   ├── components/               # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleDashboard.jsx
│   ├── context/                  # Global state management
│   │   └── AuthContext.jsx
│   ├── services/                 # API integration
│   │   ├── apiClient.js
│   │   └── api.js
│   ├── hooks/                    # Custom React hooks
│   │   └── (placeholder)
│   ├── utils/                    # Utility functions
│   │   └── (placeholder)
│   ├── firebase.js               # Firebase configuration
│   ├── App.jsx                   # Main routing
│   ├── App.css                   # Global styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global CSS
├── public/                       # Static assets
├── package.json
├── vite.config.js
├── .env                          # Environment variables
└── FRONTEND_GUIDE.md             # This file
```

### CSS Files Organization

```
src/
├── components/
│   └── Navbar.css
├── pages/
│   ├── public/
│   │   └── PublicPages.css
│   ├── Student/
│   │   └── StudentPages.css
│   ├── HallAdmin/
│   │   └── AdminPages.css
│   ├── HallStaff/
│   │   └── HallStaffPages.css
│   └── SuperAdmin/
│       └── SuperAdminPages.css
└── App.css
```

---

## Core Systems

### 1. Authentication System (Firebase)

Firebase handles user authentication with email and password. The flow:

1. User signs up with email/password
2. Firebase creates account and returns user
3. Frontend sends user data to backend via API
4. Backend registers user with their role
5. Next login retrieves user data from backend

**Firebase Methods Used:**

- `createUserWithEmailAndPassword()` - User signup
- `signInWithEmailAndPassword()` - User login
- `signOut()` - User logout
- `getIdToken()` - Get bearer token for API calls
- `updatePassword()` - Change password
- `reauthenticateWithCredential()` - Verify password before changes

### 2. Authorization System (Context + ProtectedRoute)

The authorization system controls access based on user roles:

1. AuthContext maintains global auth state
2. ProtectedRoute wraps role-specific pages
3. ProtectedRoute checks if user has required role
4. If not authorized, redirect to login or dashboard
5. If authorized, render the component

**Roles:**

- STUDENT - View own profile, change password
- HALL_ADMIN - Create hall staff, manage staff/students in hall
- HALL_STAFF - Manage students, issue dining tokens
- SUPER_ADMIN - Create halls, manage admins, view all students

### 3. API Communication Layer

API communication uses Axios with automatic token attachment:

1. Request: Component calls API method from services/api.js
2. Interceptor: Request interceptor attaches Firebase token
3. Send: Axios sends request with Authorization header
4. Response: Backend returns data
5. Error: 401 errors redirect to login

**Axios Configuration:**

- Base URL: from VITE_API_BASE_URL environment variable
- Timeout: 30 seconds
- Request Interceptor: Adds Firebase ID token to every request
- Response Interceptor: Handles 401 errors globally

---

## Authentication Flow

### Sign-Up Flow (Registration)

```
1. User goes to /register
2. RegistrationPage renders
3. User fills form:
   - Email
   - Password
   - Confirm Password
4. On Submit:
      - Firebase creates account
      - Get Firebase ID token
      - API Call: POST /api/v1/students
      - Backend creates student record
   c. AuthContext updates with user data
   d. Redirect to /dashboard
5. RoleDashboard routes to StudentDashboard
```

### Sign-In Flow (Login)

```
1. User goes to /login
2. LoginPage renders
3. User enters email and password
4. On Submit:
   a. Firebase: signInWithEmailAndPassword()
   b. If success:
      - AuthContext detects auth state change
      - fetchUserData() called
      - API Call: GET /api/v1/students/{firebaseUid}
      - Backend returns student data with role
      - AuthContext updates userData with role
   c. Redirect to /dashboard
5. RoleDashboard routes to appropriate dashboard
```

### Logout Flow

```
1. User clicks logout button
2. Navbar calls useAuth().logout()
3. logout() function:
   a. Firebase: signOut()
   b. AuthContext updates state
   c. Redirect to /
```

---

## Role-Based Access Control

### ProtectedRoute Component

ProtectedRoute enforces role-based access:

```javascript
<ProtectedRoute requiredRole={["STUDENT"]}>
  <StudentDashboard />
</ProtectedRoute>
```

**Logic:**

1. Check if user is authenticated (has auth token)
2. Check if user's role matches requiredRole
3. If both pass: Render component
4. If no auth: Redirect to /login
5. If wrong role: Redirect to /dashboard (will route to their role's dashboard)

### Role-Based Routing

RoleDashboard component routes users to their appropriate dashboard:

```
/dashboard → RoleDashboard
  ├─ STUDENT → StudentDashboard
  ├─ HALL_ADMIN → HallAdminDashboard
  ├─ HALL_STAFF → HallStaffDashboard
  └─ SUPER_ADMIN → SuperAdminDashboard
```

### Dashboard Isolation

Each role has dedicated pages that:

1. Only render if user has that role
2. Are wrapped in ProtectedRoute with requiredRole
3. Redirect to /dashboard if user tries to access wrong role
4. Can only access APIs for their role

---

## API Integration

### API Endpoint Mapping

All API endpoints use Firebase UID as identifier. The pattern is:

```
/api/v1/{resource}/{firebaseUid}
```

**Student Endpoints:**

```
GET    /api/v1/students/{uid}              - Get student profile
POST   /api/v1/students                    - Register student
PUT    /api/v1/students/{uid}              - Update profile
POST   /api/v1/students/change-password    - Change password
GET    /api/v1/students                    - Get all students
```

**Admin Endpoints:**

```
GET    /api/v1/admins/{uid}                - Get admin profile
POST   /api/v1/admins                      - Create admin
```

**Staff Endpoints:**

```
GET    /api/v1/staff/{uid}                 - Get staff profile
POST   /api/v1/staff                       - Create staff
```

**Hall Endpoints:**

```
POST   /api/v1/halls                       - Create hall
GET    /api/v1/halls                       - Get all halls
GET    /api/v1/halls/{hallId}              - Get hall by ID
PUT    /api/v1/halls/{hallId}              - Update hall
PATCH  /api/v1/halls/{hallId}/status       - Update hall status
```

### How to Make API Calls

**Step 1: Import the API service**

```javascript
import { studentAPI, hallAPI } from "../../services/api";
```

**Step 2: Get user ID from AuthContext**

```javascript
const { user } = useAuth();
```

**Step 3: Call API method**

```javascript
try {
  const response = await studentAPI.getProfile(user.uid);
  console.log(response.data);
} catch (error) {
  console.error("API Error:", error);
}
```

**Step 4: Handle response**

```javascript
useState to store data
setLoading and setError for state
Re-render component with new data
```

### Error Handling

Errors are handled at multiple levels:

1. **API Client Level:** 401 errors redirect to login
2. **Component Level:** Try-catch blocks handle errors
3. **User Feedback:** Error states displayed in UI
4. **Console Logging:** Errors logged for debugging

---

## Component Guide

### Public Components

#### HomePage.jsx

- Purpose: Landing page
- Access: Everyone (unauthenticated users)
- Features: Welcome message, login/register links
- No data fetching

#### LoginPage.jsx

- Purpose: User authentication
- Access: Unauthenticated users
- Features:
  - Email/password input
  - Firebase authentication
  - Loading state during auth
  - Error display
  - Redirect on success
- API Calls: None (Firebase handles it)

#### RegistrationPage.jsx

- Purpose: New student registration
- Access: Unauthenticated users only
- Features:
  - Form validation
  - Student role indicator
  - Firebase account creation
  - Backend student registration
  - Password confirmation
- API Calls: POST /api/v1/students

### Student Components

#### StudentDashboard.jsx

- Purpose: Student main interface
- Access: STUDENT role only
- Features:
  - Welcome message
  - Navigation to profile and settings
  - Display of dining pass information
  - Links to utility pages
- API Calls: Gets data from AuthContext

#### ViewProfile.jsx

- Purpose: Display student profile
- Access: STUDENT role only
- Features:
  - Display user data from AuthContext
  - Show personal information
  - Show academic information
  - Show account information
  - Read-only view
- API Calls: None (uses AuthContext data)

#### ChangePassword.jsx

- Purpose: Allow password updates
- Access: STUDENT role only
- Features:
  - Current password verification
  - New password input
  - Password confirmation
  - Loading state
  - Success/error messages
- API Calls: None (Firebase handles it directly)

### Hall Admin Components

#### HallAdminDashboard.jsx

- Purpose: Hall admin main interface
- Access: HALL_ADMIN role only
- Features:
  - Hall overview
  - Button to create new staff
  - Links to staff and student lists
  - Quick stats
- API Calls: None (dashboard only)

#### CreateHallStaff.jsx

- Purpose: Form to add new staff members
- Access: HALL_ADMIN role only
- Features:
  - Staff information form
  - Firebase account creation
  - Backend staff registration
  - Form validation
  - Error handling
  - Success redirect
- API Calls:
  - Firebase: createUserWithEmailAndPassword
  - Backend: POST /api/v1/staff

#### HallAdminStaffList.jsx

- Purpose: Display staff under this hall
- Access: HALL_ADMIN role only
- Features:
  - Table of staff members
  - Staff details (name, email, status)
  - Search/filter options
  - Edit/delete actions
- API Calls: GET /api/v1/staff

#### HallAdminStudents.jsx

- Purpose: Display students in this hall
- Access: HALL_ADMIN role only
- Features:
  - Table of students
  - Student details (name, ID, dining balance)
  - Search/filter options
  - Status management
- API Calls: GET /api/v1/students

### Hall Staff Components

#### HallStaffDashboard.jsx

- Purpose: Hall staff main interface
- Access: HALL_STAFF role only
- Features:
  - Daily overview
  - Student management link
  - Token issuance interface
  - Dining hall announcements
- API Calls: None (dashboard only)

#### HallStaffStudents.jsx

- Purpose: View students for token issuance
- Access: HALL_STAFF role only
- Features:
  - Table of hall students
  - Search by student ID or name
  - Current dining balance display
  - Link to issue token
- API Calls: GET /api/v1/students

#### IssueToken.jsx

- Purpose: Dining token management
- Access: HALL_STAFF role only
- Features:
  - Select student or scan ID
  - Issue dining token
  - Display token details
  - Confirmation messages
- API Calls: POST /api/v1/tokens (backend endpoint)

### Super Admin Components

#### SuperAdminDashboard.jsx

- Purpose: System admin main interface
- Access: SUPER_ADMIN role only
- Features:
  - System overview
  - Button to create new hall
  - Links to halls/admins/students lists
  - System-wide statistics
- API Calls: None (dashboard only)

#### CreateHall.jsx

- Purpose: Add new dining hall
- Access: SUPER_ADMIN role only
- Features:
  - Hall information form (name, capacity, location)
  - Form validation
  - Backend submission
  - Error handling
  - Success redirect
- API Calls: POST /api/v1/halls

#### SuperAdminHalls.jsx

- Purpose: View all halls in system
- Access: SUPER_ADMIN role only
- Features:
  - Table of all halls
  - Hall details (name, capacity, status)
  - Edit/delete actions
  - Search/filter
- API Calls: GET /api/v1/halls

#### SuperAdminAdmins.jsx

- Purpose: Manage hall administrators
- Access: SUPER_ADMIN role only
- Features:
  - Table of all admins
  - Admin details (name, hall, status)
  - Create/edit/delete actions
  - Search/filter
- API Calls: GET /api/v1/admins

#### SuperAdminStudents.jsx

- Purpose: View all students
- Access: SUPER_ADMIN role only
- Features:
  - Table of all students
  - Student details (name, ID, hall, status)
  - Search/filter/sort
  - Suspend/activate actions
- API Calls: GET /api/v1/students

### Navigation Components

#### Navbar.jsx

- Purpose: Global navigation
- Features:
  - Display current user role
  - Display user name/email
  - Role-specific navigation links
  - Logout button
  - Back to home link
  - Responsive design
- Styling: Navbar.css
- Used in: App.jsx layout

#### ProtectedRoute.jsx

- Purpose: Route protection
- Features:
  - Check authentication
  - Check user role
  - Redirect if unauthorized
  - Accept requiredRole prop
- Props:
  - children: Component to render
  - requiredRole: Array of allowed roles

#### RoleDashboard.jsx

- Purpose: Route to correct dashboard
- Features:
  - Check user role
  - Render appropriate dashboard
  - Handle no role scenario
  - Automatic routing
- Used in: /dashboard route

---

## Routing

### Route Structure

```
App.jsx
├── BrowserRouter
│   ├── Routes
│   │   ├── Public Routes (no authentication required)
│   │   │   ├── / (HomePage)
│   │   │   ├── /login (LoginPage)
│   │   │   └── /register (RegistrationPage)
│   │   │
│   │   └── Protected Routes (authentication required)
│   │       ├── /dashboard (RoleDashboard - auto-routes by role)
│   │       │   ├── /dashboard/student (StudentDashboard)
│   │       │   ├── /dashboard/student/profile (ViewProfile)
│   │       │   ├── /dashboard/student/change-password (ChangePassword)
│   │       │   │
│   │       │   ├── /dashboard/admin (HallAdminDashboard)
│   │       │   ├── /dashboard/admin/create-staff (CreateHallStaff)
│   │       │   ├── /dashboard/admin/staff-list (HallAdminStaffList)
│   │       │   ├── /dashboard/admin/students (HallAdminStudents)
│   │       │   │
│   │       │   ├── /dashboard/staff (HallStaffDashboard)
│   │       │   ├── /dashboard/staff/students (HallStaffStudents)
│   │       │   ├── /dashboard/staff/issue-token (IssueToken)
│   │       │   │
│   │       │   ├── /dashboard/superadmin (SuperAdminDashboard)
│   │       │   ├── /dashboard/superadmin/create-hall (CreateHall)
│   │       │   ├── /dashboard/superadmin/halls (SuperAdminHalls)
│   │       │   ├── /dashboard/superadmin/admins (SuperAdminAdmins)
│   │       │   └── /dashboard/superadmin/students (SuperAdminStudents)
│   │       │
│   │       └── Fallback: 404 or redirect to /dashboard
```

### Navigation Patterns

**Programmatic Navigation:**

```javascript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/dashboard");
```

**Link Navigation:**

```javascript
import { Link } from "react-router-dom";

<Link to="/dashboard">Go to Dashboard</Link>;
```

**Redirect on Auth Success:**

```javascript
// In LoginPage or RegistrationPage
useEffect(() => {
  if (userData && user) {
    navigate("/dashboard");
  }
}, [userData, user, navigate]);
```

---

## Styling

### CSS Architecture

The project uses plain CSS with a component-based structure:

1. **Global Styles:** App.css, index.css
2. **Component Styles:** Navbar.css
3. **Page Styles:** By role (PublicPages.css, StudentPages.css, etc.)

### CSS File Organization

**App.css** - Global styles

```css
- Root color variables
- Body styles
- Page wrapper styles
- Typography defaults
- Spacing utilities
- Layout utilities
```

**Navbar.css** - Navigation bar

```css
- Navigation bar container
- Navigation links
- User info display
- Logout button
- Responsive design
```

**PublicPages.css** - Public page styles

```css
- HomePage styling
- LoginPage form styles
- RegistrationPage form styles
- Input field styling
- Button styling
- Error/success messages
```

**StudentPages.css** - Student pages

```css
- StudentDashboard layout
- ViewProfile styling
- ChangePassword form
- Profile sections
- Card styling
```

**AdminPages.css** - Hall admin pages

```css
- HallAdminDashboard
- CreateHallStaff form
- Staff/student list tables
- Stat cards
- Data table styling
```

**HallStaffPages.css** - Hall staff pages

```css
- HallStaffDashboard
- Student list styling
- IssueToken form
- Token display
```

**SuperAdminPages.css** - Super admin pages

```css
- SuperAdminDashboard
- CreateHall form
- System-wide list tables
- Admin controls
```

### Common CSS Classes

```css
.page-wrapper        /* Main page container */
.card               /* Card container */
.page-title         /* Page heading */
.form-group         /* Form input group */
.btn                /* Button styling */
.btn-primary        /* Primary button */
.btn-secondary      /* Secondary button */
.btn-danger         /* Danger button */
.table               /* Data table */
.table-row          /* Table row */
.stat-card          /* Statistics card */
.error              /* Error message */
.success            /* Success message */
.loading            /* Loading indicator */
```

### Responsive Design

All pages are responsive and adapt to:

- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

Media queries adjust:

- Font sizes
- Padding/margins
- Layout (flex direction)
- Grid columns
- Display properties

---

## State Management

### Global State: AuthContext

AuthContext manages global authentication state:

**State Variables:**

```javascript
user; // Firebase user object
role; // User role string
userData; // User data from backend
loading; // Loading state
error; // Error messages
isAuthenticated; // Boolean flag
```

**Functions:**

```javascript
login(); // Firebase sign in
register(); // Firebase sign up
logout(); // Firebase sign out
refreshUserData(); // Fetch updated user data
getIdToken(); // Get Firebase token
```

**Usage in Components:**

```javascript
const { user, role, userData, loading, error } = useAuth();
```

### Local Component State

Components use useState for local state:

```javascript
const [formData, setFormData] = useState({...});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);
```

### State Update Patterns

**Async Data Fetching:**

```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getData();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

**Form Handling:**

```javascript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.submitForm(formData);
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Development Workflow

### Starting Development Server

```bash
cd clients/user
npm install              # Install dependencies (if needed)
npm run dev              # Start Vite dev server
```

The application will be available at `http://localhost:5173`

### Making Changes

1. **Edit a component file** in src/
2. **Vite detects changes** (HMR - Hot Module Replacement)
3. **Browser automatically refreshes** with new code
4. **State is preserved** during HMR when possible

### Building for Production

```bash
npm run build           # Create optimized build
npm run preview         # Preview production build locally
```

Output goes to `dist/` folder

### Testing Changes

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Navigate through pages
4. Check browser console for errors
5. Open browser DevTools (F12) to debug

### Common Development Tasks

**Add a new page:**

1. Create file in pages/{role}/NewPage.jsx
2. Create CSS file pages/{role}/NewPages.css (if needed)
3. Add route in App.jsx
4. Import and use like other pages

**Add a new API call:**

1. Add method to services/api.js
2. Use in component: `await myAPI.method()`
3. Handle response with try-catch
4. Update state and UI

**Add styling:**

1. Create or edit CSS file for that page/component
2. Add classes to JSX elements
3. Save and Vite will refresh browser
4. Check DevTools to debug styles

**Debug issues:**

1. Check browser console (F12) for errors
2. Check network tab for API calls
3. Look at Redux DevTools if using Redux
4. Add console.log() statements in code
5. Check .env file for correct config

---

## Environment Configuration

### Environment Variables

Create a `.env` file in `clients/user/` with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend API
VITE_API_BASE_URL=http://localhost:8080  # or your backend URL
```

### Environment Variable Usage

```javascript
// In any file
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

### Different Environments

**Development (.env):**

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Production (.env.production):**

```env
VITE_API_BASE_URL=https://api.mbstu-diningpass.com
```

Switch with: `npm run build -- --mode production`

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" Error

**Problem:** Import error when starting dev server

**Causes:**

- File doesn't exist at that path
- Wrong import path (check folder nesting)
- CSS file not found

**Solution:**

1. Check file exists at that path
2. Count folder levels and adjust import: `../` for each level up
3. For CSS: Make sure CSS file is in correct folder

#### 2. 404 API Error

**Problem:** API calls fail with 404 response

**Causes:**

- Wrong API endpoint path
- Backend service not running
- Firebase token not attached

**Solution:**

1. Check VITE_API_BASE_URL in .env
2. Verify backend is running (test with curl/Postman)
3. Check API endpoint path matches backend
4. Verify Firebase token is being attached (check Network tab)

#### 3. Authentication Not Working

**Problem:** Can't login or register

**Causes:**

- Firebase not configured correctly
- Firebase credentials invalid
- Backend registration fails

**Solution:**

1. Check .env file has all Firebase keys
2. Test Firebase directly in FirebaseTestApp.jsx
3. Check browser console for specific error
4. Verify backend is running and accepting requests

#### 4. Role-Based Access Not Working

**Problem:** Can access pages you shouldn't be able to

**Causes:**

- ProtectedRoute not set correctly
- Role from backend is undefined/null
- Wrong role string

**Solution:**

1. Check ProtectedRoute has requiredRole prop
2. Verify backend is returning role in user data
3. Check AuthContext properly sets role
4. Verify role string matches exactly (STUDENT, HALL_ADMIN, etc.)

#### 5. Styles Not Applying

**Problem:** CSS changes don't show up

**Causes:**

- CSS file not imported in component
- CSS class name typo
- Specificity issues in CSS
- Cache issue

**Solution:**

1. Check CSS file is imported: `import './PageName.css'`
2. Verify class name matches CSS (case-sensitive)
3. Use browser DevTools to inspect applied styles
4. Hard refresh browser (Ctrl+Shift+R)
5. Clear browser cache if needed

#### 6. Vite Dev Server Won't Start

**Problem:** npm run dev fails

**Causes:**

- Port 5173 already in use
- Node modules not installed
- Node version incompatible

**Solution:**

1. Kill process on port 5173: `lsof -i :5173` then `kill -9 <PID>`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node version: `node --version` (need v14+)

#### 7. Environmental Variable Not Available

**Problem:** import.meta.env.VITE\_\* returns undefined

**Causes:**

- Variable not defined in .env
- Variable doesn't start with VITE\_
- .env file in wrong location
- Changes to .env not picked up

**Solution:**

1. Verify variable exists in .env
2. Ensure it starts with VITE\_ prefix
3. Check .env is in clients/user/ folder
4. Restart dev server after .env changes

#### 8. Token Expiry Issues

**Problem:** After 1 hour, API calls fail with 401

**Causes:**

- Firebase token expires
- apiClient not refreshing token
- Interceptor not updated

**Solution:**

1. apiClient automatically gets fresh token on each request
2. 401 responses redirect to /login
3. User needs to login again for new token
4. Check Response Interceptor in apiClient.js

### Debug Mode

Enable debugging by checking browser DevTools:

**Network Tab:**

- Check all API requests
- Verify Authorization header present
- Check request/response bodies
- Monitor for 404, 401, 500 errors

**Console Tab:**

- Check for JavaScript errors
- Look for API error logs
- Check for component warnings
- Verify auth state changes

**Application Tab:**

- Check localStorage for auth tokens
- Verify Firebase config
- Check cookies if used

**Components Tab (React DevTools):**

- Inspect component state
- Check prop values
- Verify context values
- Track component re-renders

