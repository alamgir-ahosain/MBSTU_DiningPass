# Student Pages - User Guide & Testing

## Quick Start

### Access Student Pages
All student pages require authentication with `STUDENT` role.

```
Dashboard: /student/dashboard
Profile:   /student/profile
Meal Booking: /student/cut-token
Change Password: /student/change-password
Forgot Password: /student/forgot-password
```

## Component Usage

### StudentDashboard
**Import:**
```javascript
import { StudentDashboard } from './pages/Student/dashboard/StudentDashboard';
```

**Purpose:**
Main entry point for students with quick navigation to all features.

**Data Used:**
- `userData.fullName` - Student's full name
- `userData.hallShortName` - Student's hall
- `userData.department` - Student's department

---

### StudentProfile
**Import:**
```javascript
import { StudentProfile } from './pages/Student/profile/StudentProfile';
```

**Purpose:**
Complete profile management with edit capabilities and security options.

**Features:**
- Edit personal information
- Change password
- Forgot password
- Logout

**Data Used:**
- `userData.*` - All student profile fields
- Auth context for logout

---

### CutToken
**Import:**
```javascript
import { CutToken } from './pages/Student/cut_token/CutToken';
```

**Purpose:**
Meal token booking and payment submission.

**Features:**
- View available meals
- Select meal for booking
- Fill payment information
- Upload payment proof
- Submit payment

**API Calls:**
1. `hallAdminAPI.getMealConfigs()` - Fetch available meals
2. Direct API call to `/api/v1/meal-tokens` - Submit token booking

---

## Testing Scenarios

### Test 1: Dashboard Navigation
**Steps:**
1. Login as student
2. Navigate to `/student/dashboard`
3. Verify dashboard loads with student name
4. Click each navigation card
5. Verify routing works

**Expected Results:**
- Dashboard displays correctly
- All cards are clickable
- Info cards show correct hall and department

---

### Test 2: Profile Viewing
**Steps:**
1. Go to `/student/profile`
2. Verify all profile information displays
3. Check all sections are visible

**Expected Results:**
- Personal Information section shows name and email
- Academic Information shows student ID and department
- Hall Information shows hall and room number
- Account Information shows gender and status

---

### Test 3: Profile Editing
**Steps:**
1. Go to `/student/profile`
2. Click "Edit Profile" button
3. Modify Full Name field
4. Modify Room Number field
5. Click "Save Changes"
6. Wait for success message

**Expected Results:**
- Input fields become editable
- Changes are submitted to backend
- Success message appears
- Page reloads with new data

---

### Test 4: Password Management
**Steps:**
1. From profile page, click "Change Password"
2. Enter old and new passwords
3. Click change password button

**Expected Results:**
- Page navigates to change password form
- Form accepts valid input
- Request sent to backend

---

### Test 5: Forgot Password
**Steps:**
1. From profile page, click "Forgot Password?"
2. Enter email address
3. Click "Send Reset Link"

**Expected Results:**
- Email field accepts input
- Success message shows
- Auto-redirect to login after 3 seconds

---

### Test 6: Meal Token Booking - View Meals
**Steps:**
1. Go to `/student/cut-token`
2. Wait for page to load
3. Verify meal cards display

**Expected Results:**
- Meal cards load and display
- Each card shows:
  - Meal type (LUNCH/DINNER)
  - Date with badge
  - Menu description
  - Price in BDT
  - Booking deadline
  - Token expiry time
- Special notes show if available

---

### Test 7: Meal Token Booking - Payment Form
**Steps:**
1. On cut-token page, click "Cut Token" button on a meal
2. Payment form modal opens
3. Verify form elements are present

**Expected Results:**
- Modal overlay appears
- Modal content shows:
  - Meal summary
  - Payment method dropdown
  - Sender number input
  - Meal types selection
  - Screenshot upload
  - Submit button

---

### Test 8: Payment Form Validation
**Steps:**
1. Open payment form
2. Leave fields empty
3. Click "Submit Payment"
4. Fill payment method only
5. Click "Submit Payment"
6. Fill sender number with invalid format
7. Click "Submit Payment"

**Expected Results:**
- Error: "Please enter your payment mobile number"
- Error: "Please select at least one meal type"
- Sender number should validate pattern: 01XXXXXXXXX

---

### Test 9: Payment Submission
**Steps:**
1. Fill all payment form fields:
   - Payment Method: bKash or Nagad
   - Sender Number: 01712345678
   - Meal Types: Check appropriate type
   - Screenshot: Optional, select file
2. Click "Submit Payment"
3. Wait for response

**Expected Results:**
- Loading state shows "Submitting..."
- Success message appears
- Modal closes
- Meal list refreshes

---

### Test 10: Logout
**Steps:**
1. Go to profile page
2. Click "Logout" button
3. Verify redirect to home page
4. Verify session cleared

**Expected Results:**
- User logged out
- Redirected to home page
- Cannot access student pages anymore

---

## Responsive Design Testing

### Mobile (Below 768px)
**Steps:**
1. Open dev tools (F12)
2. Toggle device toolbar
3. Select mobile device (iPhone 12, Pixel 5, etc.)
4. Navigate through all pages
5. Test form inputs on mobile

**Expected Results:**
- All buttons are large enough to tap
- Forms stack vertically
- Text is readable
- No horizontal scrolling needed
- Payment form modal is usable

### Tablet (768px - 1199px)
**Steps:**
1. Set viewport to tablet size
2. Navigate pages
3. Test interactions

**Expected Results:**
- Grid layouts adapt appropriately
- All content visible
- Buttons properly sized

### Desktop (1200px+)
**Steps:**
1. View on full desktop
2. Verify optimal layout

**Expected Results:**
- Multi-column layouts
- Optimal spacing
- Professional appearance

---

## Error Handling Testing

### Test Network Error
**Steps:**
1. Turn off network
2. Try to load cut-token page
3. Observe error message

**Expected Results:**
- Error message displays
- Retry option or back link available

---

### Test Invalid Profile Update
**Steps:**
1. Edit profile with invalid data
2. Leave required fields empty
3. Try to save

**Expected Results:**
- Client-side validation prevents submission
- Error message shows

---

## API Integration Testing

### Using Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions and observe requests:

**Expected API Calls:**

For Meal Configs:
```
GET /api/v1/meal-configs?hallShortName=JAMH
Status: 200
```

For Token Cutting:
```
POST /api/v1/meal-tokens
Body: {
  paymentMethod: "BKASH",
  senderNumber: "01712345678",
  mealDate: "2026-05-20",
  mealTypes: ["LUNCH"],
  screenshotUrl: "..."
}
```

---

## Performance Testing

### Page Load Time
- Dashboard: < 1s
- Profile: < 1s
- Cut Token: < 2s (includes meal config fetch)

### Image Optimization
- Payment screenshot should be compressed
- No large unoptimized images

---

## Accessibility Testing

### Keyboard Navigation
- Tab through all buttons and inputs
- Enter key submits forms
- Escape closes modals

### Screen Reader
- Test with NVDA or JAWS
- Verify headings and labels read correctly
- Form inputs have proper labels

---

## Browser DevTools Console

Check console for:
- ✅ No JavaScript errors
- ✅ No 404 errors
- ✅ No CORS issues
- ✅ Proper console messages for debugging

---

## Example Test Data

### Student Login
```
Email: student@university.edu
Password: (use actual password)
```

### Sample Payment
```
Payment Method: bKash
Sender Number: 01712345678
Meal Type: LUNCH
Hall: JAMH
Date: 2026-05-20
```

---

## Troubleshooting

### Meal configs not loading
- Check hall short name in userData
- Verify API endpoint is accessible
- Check network requests in DevTools

### Payment form not submitting
- Verify all required fields are filled
- Check sender number format (01XXXXXXXXX)
- Verify screenshot upload if required
- Check API response in network tab

### Modal not closing
- Try clicking X button or Cancel
- Check for JavaScript errors in console
- Refresh page if stuck

---

## Checklist for QA

- [ ] All pages load without errors
- [ ] Dashboard displays correct information
- [ ] Profile shows all student data
- [ ] Profile edit functionality works
- [ ] Meal cards display correctly
- [ ] Payment form validation works
- [ ] Payment submission succeeds
- [ ] Logout works properly
- [ ] Responsive design on all screen sizes
- [ ] All API calls return correct data
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] No console errors
- [ ] Keyboard navigation works
- [ ] Mobile experience is smooth

---

## Support & Documentation

For more information, see:
- `STUDENT_PAGES_README.md` - Detailed page structure
- `API` endpoints in `docs/APIs/api-reference.md`
- Database models in `docs/database/MODELS_SCHEMA.md`

---

**Last Updated:** May 19, 2026
**Version:** 1.0
