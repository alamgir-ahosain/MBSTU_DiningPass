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
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { ViewProfile } from './pages/Student/ViewProfile';
import { ChangePassword } from './pages/Student/ChangePassword';

// Hall Admin Pages
import { HallAdminDashboard } from './pages/HallAdmin/HallAdminDashboard';
import { CreateHallStaff } from './pages/HallAdmin/CreateHallStaff';
import { HallAdminStaffList } from './pages/HallAdmin/HallAdminStaffList';
import { HallAdminStudents } from './pages/HallAdmin/HallAdminStudents';

// Hall Staff Pages
import { HallStaffDashboard } from './pages/HallStaff/HallStaffDashboard';
import { HallStaffStudents } from './pages/HallStaff/HallStaffStudents';
import { IssueToken } from './pages/HallStaff/IssueToken';

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
                    <ViewProfile />
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
                path="/hallAdmin/create-staff"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <CreateHallStaff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallAdmin/staff-list"
                element={
                  <ProtectedRoute requiredRole="HALL_ADMIN">
                    <HallAdminStaffList />
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
                path="/hallStaff/students"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <HallStaffStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hallStaff/issue-token"
                element={
                  <ProtectedRoute requiredRole="HALL_STAFF">
                    <IssueToken />
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
