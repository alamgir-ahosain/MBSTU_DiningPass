# Student Pages Structure

This document outlines the Student role pages organization following the hall admin structure pattern.

## Folder Structure

```
Student/
├── dashboard/
│   └── StudentDashboard.jsx       # Main student dashboard with quick access cards
├── profile/
│   └── StudentProfile.jsx         # View/edit profile, change password, logout
├── cut_token/
│   ├── CutToken.jsx               # Meal token booking page with payment form
│   └── CutToken.css               # Styles for meal tokens and payment modal
├── ChangePassword.jsx             # Change password page
├── StudentForgotPassword.jsx       # Forgot password page
├── StudentDashboard.jsx            # Legacy dashboard (deprecated, use dashboard/StudentDashboard.jsx)
├── ViewProfile.jsx                 # Legacy profile (deprecated, use profile/StudentProfile.jsx)
└── StudentPages.css                # Shared styles for all student pages
```

## Pages Overview

### 1. **StudentDashboard** (`dashboard/StudentDashboard.jsx`)
Main dashboard for students with quick navigation cards.

**Features:**
- Welcome message with student name
- Quick navigation cards for:
  - My Profile
  - Cut Meal Token
  - Change Password
- Info cards showing:
  - Dining Pass Status
  - Hall Information
  - Department
- Quick info section with student details

**Route:** `/student/dashboard`

---

### 2. **StudentProfile** (`profile/StudentProfile.jsx`)
Complete profile management page.

**Features:**
- View personal information (Full Name, Email)
- View academic information (Student ID, Department)
- View hall information (Hall, Room Number)
- View account information (Gender, Status)
- Edit profile (Full Name, Room Number)
- Change password link
- Forgot password link
- Logout button

**Route:** `/student/profile`

**API Endpoints Used:**
- `GET /api/v1/students/me` - Get profile
- `PUT /api/v1/students/me` - Update profile

---

### 3. **CutToken** (`cut_token/CutToken.jsx`)
Meal token booking and payment submission page.

**Features:**
- Display all available meal configurations for the student's hall
- Show meal details:
  - Meal type (LUNCH/DINNER)
  - Date
  - Menu
  - Price
  - Booking deadline
  - Token expiry time
  - Special feast note (optional)
- Cut Token button for each meal
- Payment form modal with:
  - Payment method selector (bKash/Nagad)
  - Sender mobile number input
  - Meal type selection (checkbox)
  - Payment proof screenshot upload
  - Submit payment button
  - Form validation

**Route:** `/student/cut-token`

**API Endpoints Used:**
- `GET /api/v1/meal-configs` - Get meal configurations
- `POST /api/v1/meal-tokens` - Cut/book meal token

**Styling:**
- Responsive grid layout for meal cards
- Modal for payment form
- Mobile-friendly design

---

### 4. **ChangePassword** (`ChangePassword.jsx`)
Change password page (existing component).

**Route:** `/student/change-password`

---

### 5. **StudentForgotPassword** (`StudentForgotPassword.jsx`)
Forgot password page for students.

**Features:**
- Email input field
- Send reset link functionality
- Success/error messages
- Auto-redirect to login after success

**Route:** `/student/forgot-password`

---

## Styling

### Shared Styles (`StudentPages.css`)
Contains styles for:
- Dashboard layouts
- Card components
- Profile sections
- Form elements
- Button variants (primary, secondary, info, logout, cancel)
- Messages (error, success, info)
- Responsive design

### CutToken Specific Styles (`cut_token/CutToken.css`)
Contains styles for:
- Meal config cards
- Modal overlay and content
- Payment form elements
- File upload styling
- Responsive mobile layout

## API Integration

### Meal Token API Methods (in `services/api.js`)

```javascript
export const mealTokenAPI = {
  cutToken: (payload) => {
    // POST /api/v1/meal-tokens
    // Submits meal token booking with payment info
  },
  
  getMyTokens: () => {
    // GET /api/v1/meal-tokens/my
    // Gets student's approved meal tokens
  },
  
  getTokenById: (id) => {
    // GET /api/v1/meal-tokens/{id}
    // Gets specific token details
  },
};
```

### Payment API Methods (in `services/api.js`)

```javascript
export const paymentAPI = {
  getPayments: (filters = {}) => {
    // GET /api/v1/payments
    // Gets student's payment history
  },
  
  getPaymentById: (id) => {
    // GET /api/v1/payments/{id}
    // Gets specific payment details
  },
  
  submitPayment: (payload) => {
    // POST /api/v1/payments
    // Submits payment information
  },
};
```

## Routes

All student routes are protected with `ProtectedRoute` requiring `STUDENT` role:

```javascript
/student/dashboard          - Main dashboard
/student/profile            - Profile management
/student/cut-token          - Meal token booking
/student/change-password    - Change password
/student/forgot-password    - Forgot password
```

## Component Props

All components use `useAuth()` hook from `AuthContext` to access:
- `userData` - Current student's information
- `logout` - Logout function

## Form Validation

### Cut Token Payment Form
- **Payment Method:** Required, dropdown (BKASH/NAGAD)
- **Sender Number:** Required, pattern validation (01XXXXXXXXX)
- **Meal Types:** Required, at least one must be selected
- **Screenshot URL:** Optional, file upload

### Profile Edit Form
- **Full Name:** Required, 2-100 characters
- **Room Number:** Optional, max 15 characters

## Error Handling

All pages include:
- Try-catch blocks for API calls
- User-friendly error messages
- Loading states
- Validation feedback
- Message components (error, success, info)

## Responsive Design

All pages are responsive with:
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly buttons and inputs
- Flexible grid layouts

## Future Enhancements

1. Add real file upload for payment screenshots
2. Add student meal history/statistics
3. Add QR code display for used tokens
4. Add payment status tracking
5. Add email verification for payment submission
