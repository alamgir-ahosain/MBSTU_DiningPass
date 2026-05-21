import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { RoleDashboard } from './components/RoleDashboard';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegistrationPage } from './pages/public/RegistrationPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/Student/dashboard/StudentDashboard';
import { StudentProfile } from './pages/Student/profile/StudentProfile';
import { ChangePassword } from './pages/Student/ChangePassword';
import { CutToken } from './pages/Student/cut_token/CutToken';
import { StudentMealTokens } from './pages/Student/tokens/StudentMealTokens';
import { StudentForgotPassword } from './pages/Student/StudentForgotPassword';

// Hall Admin Pages
import { HallAdminDashboard } from './pages/HallAdmin/dashboard/HallAdminDashboard';
import { HallAdminStaff } from './pages/HallAdmin/staff/HallAdminStaff';
import { HallAdminStudents } from './pages/HallAdmin/student/HallAdminStudents';
import { HallAdminMealConfigs } from './pages/HallAdmin/meal/HallAdminMealConfigs';
import { HallAdminPayments } from './pages/HallAdmin/payment/HallAdminPayments';
import { HallAdminProfile } from './pages/HallAdmin/my/HallAdminProfile';
import { HallAdminChangePassword } from './pages/HallAdmin/my/HallAdminChangePassword';
import { HallAdminForgotPassword } from './pages/HallAdmin/my/HallAdminForgotPassword';

// Hall Staff Pages
import { HallStaffDashboard } from './pages/HallStaff/dashboard/HallStaffDashboard';
import { HallStaffPayments } from './pages/HallStaff/payment/HallStaffPayments';
import { HallStaffMealConfigs } from './pages/HallStaff/meal/HallStaffMealConfigs';
import { HallStaffProfile } from './pages/HallStaff/my/HallStaffProfile';
import { HallStaffChangePassword } from './pages/HallStaff/my/HallStaffChangePassword';
import { HallStaffForgotPassword } from './pages/HallStaff/my/HallStaffForgotPassword';
import { ValidateToken } from './pages/HallStaff/token/ValidateToken';
import { HallMealSummary } from './pages/HallStaff/summary/HallMealSummary';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/SuperAdmin/SuperAdminDashboard';
import { CreateHall } from './pages/SuperAdmin/hall/CreateHall';
import { CreateAdmin } from './pages/SuperAdmin/hallAdmin/CreateAdmin';
import { SuperAdminHalls } from './pages/SuperAdmin/hall/SuperAdminHalls';
import { SuperAdminAdmins } from './pages/SuperAdmin/hallAdmin/SuperAdminAdmins';
import { SuperAdminHallDetails } from './pages/SuperAdmin/hall/SuperAdminHallDetails';
import { SuperAdminEditHall } from './pages/SuperAdmin/hall/SuperAdminEditHall';
import { SuperAdminAdminDetails } from './pages/SuperAdmin/hallAdmin/SuperAdminAdminDetails';
import { SuperAdminProfile } from './pages/SuperAdmin/my/SuperAdminProfile';
import { SuperAdminChangePassword } from './pages/SuperAdmin/my/SuperAdminChangePassword';
import { SuperAdminForgotPassword } from './pages/SuperAdmin/my/SuperAdminForgotPassword';
import { SuperAdminStudents } from './pages/SuperAdmin/SuperAdminStudents';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegistrationPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes - Role-based Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleDashboard />
                  </ProtectedRoute>
                }
              />

               {/* Student Routes */}
               <Route
                 path="/student/dashboard"
                 element={
                   <ProtectedRoute requiredRole="STUDENT">
                     <StudentDashboard />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/student/profile"
                 element={
                   <ProtectedRoute requiredRole="STUDENT">
                     <StudentProfile />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/student/change-password"
                 element={
                   <ProtectedRoute requiredRole="STUDENT">
                     <ChangePassword />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/student/cut-token"
                 element={
                   <ProtectedRoute requiredRole="STUDENT">
                     <CutToken />
                   </ProtectedRoute>
                 }
               />
                <Route
                  path="/student/my-tokens"
                  element={
                    <ProtectedRoute requiredRole="STUDENT">
                      <StudentMealTokens />
                    </ProtectedRoute>
                  }
                />
               <Route
                 path="/student/forgot-password"
                 element={
                   <ProtectedRoute requiredRole="STUDENT">
                     <StudentForgotPassword />
                   </ProtectedRoute>
                 }
               />

              {/* Hall Admin Routes */}
              <Route
                path="/hallAdmin/dashboard"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/staff"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminStaff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/students"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/meals"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminMealConfigs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/payments"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/profile"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/change-password"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/forgot-password"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminForgotPassword />
                  </ProtectedRoute>
                }
              />

              {/* Hall Staff Routes */}
              <Route
                path="/hallStaff/dashboard"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallStaff/payments"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallStaff/meals"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffMealConfigs />
                  </ProtectedRoute>
                }
              />
                <Route
                  path="/hallStaff/summary"
                  element={
                    <ProtectedRoute requiredRole="HALL_STAFF">
                      <HallMealSummary />
                    </ProtectedRoute>
                  }
                />
              <Route
                path="/hallStaff/profile"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallStaff/change-password"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffChangePassword />
                  </ProtectedRoute>
                }
              />
               <Route
                 path="/hallStaff/forgot-password"
                 element={
                   <ProtectedRoute requiredRole="HALL_STAFF">
                     <HallStaffForgotPassword />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/hallStaff/validate-token"
                 element={
                   <ProtectedRoute requiredRole="HALL_STAFF">
                     <ValidateToken />
                   </ProtectedRoute>
                 }
               />


              {/* Super Admin Routes */}
              <Route
                path="/superAdmin/dashboard"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/create-hall"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <CreateHall />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/create-admin"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <CreateAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/forgot-password"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminForgotPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/halls"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminHalls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/halls/:id"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminHallDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/halls/:id/edit"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminEditHall />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/admins"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminAdmins />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/admins/:id"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminAdminDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/profile"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/change-password"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superAdmin/students"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminStudents />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
