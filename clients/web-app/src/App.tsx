import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { RoleDashboard } from "./components/RoleDashboard";

// Public
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegistrationPage from "./pages/public/RegistrationPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// import BkashPaymentPage   from "./pages/Student/payment/BkashPaymentPage";


// Student
import { StudentDashboard } from "./pages/Student/dashboard/StudentDashboard";

import {StudentProfile}  from "./pages/Student/profile/StudentProfile";

import { ChangePassword } from "./pages/Student/my/ChangePassword";
import { StudentMealTokens } from "./pages/Student/tokens/StudentMealTokens";
import { CutToken } from "./pages/Student/cut_token/CutToken"; // replaces BkashPaymentPage
import { PaymentSuccessPage } from "./pages/Student/payment/PaymentSuccessPage";
import { PaymentFailurePage } from "./pages/Student/payment/PaymentFailurePage";
// import { PaymentHistoryPage } from "./pages/Student/payment/PaymentHistoryPage";

// Hall Admin
// import { HallAdminDashboard } from "./pages/HallAdmin/dashboard/HallAdminDashboard";
import { HallAdminStaff } from "./pages/HallAdmin/staff/HallAdminStaff";
import { HallAdminStudents } from "./pages/HallAdmin/student/HallAdminStudents";
import { HallAdminMealConfigs } from "./pages/HallAdmin/meal/HallAdminMealConfigs";
import { HallAdminPayments } from "./pages/HallAdmin/payment/HallAdminPayments";
import { HallAdminProfile } from "./pages/HallAdmin/my/HallAdminProfile";
import { HallAdminChangePassword } from "./pages/HallAdmin/my/HallAdminChangePassword";

// Hall Staff
import { HallStaffDashboard } from "./pages/HallStaff/dashboard/HallStaffDashboard";
import { HallStaffPayments } from "./pages/HallStaff/payment/HallStaffPayments";
import { HallStaffMealConfigs } from "./pages/HallStaff/meal/HallStaffMealConfigs";
import { HallStaffProfile } from "./pages/HallStaff/my/HallStaffProfile";
import { HallStaffChangePassword } from "./pages/HallStaff/my/HallStaffChangePassword";
import { ValidateToken } from "./pages/HallStaff/token/ValidateToken";
import { HallMealSummary } from "./pages/HallStaff/summary/HallMealSummary";

// Super Admin
import { SuperAdminDashboard } from "./pages/SuperAdmin/dashboard/SuperAdminDashboard";
import { SuperAdminHalls } from "./pages/SuperAdmin/hall/SuperAdminHalls";
import { SuperAdminAdmins } from "./pages/SuperAdmin/hallAdmin/SuperAdminAdmins";
import { SuperAdminProfile } from "./pages/SuperAdmin/my/SuperAdminProfile";
import { SuperAdminChangePassword } from "./pages/SuperAdmin/my/SuperAdminChangePassword";
import {SuperAdminStudents} from "./pages/SuperAdmin/student/SuperAdminStudents";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "MBSTU_DININGPASS_QUERY_CACHE",
});

export default function App() {
  return (
      <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: 30 * 60 * 1000 }}
      >
        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* ── Public ─────────────────────────────────────────────────── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegistrationPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

              {/* bKash result pages — public (browser redirect from backend) */}
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failure" element={<PaymentFailurePage />} />

              {/* ── Role Router ────────────────────────────────────────────── */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />

              {/* ── Student ────────────────────────────────────────────────── */}
              <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute requiredRole="STUDENT"><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/change-password" element={<ProtectedRoute requiredRole="STUDENT"><ChangePassword /></ProtectedRoute>} />
              <Route path="/student/my-tokens" element={<ProtectedRoute requiredRole="STUDENT"><StudentMealTokens /></ProtectedRoute>} />
              {/*<Route path="/student/payment-history" element={<ProtectedRoute requiredRole="STUDENT"><PaymentHistoryPage /></ProtectedRoute>} />*/}
              <Route path="/student/cut-token" element={<ProtectedRoute requiredRole="STUDENT"><CutToken /></ProtectedRoute>} />
              <Route path="/student/bkash-payment" element={<ProtectedRoute requiredRole="STUDENT"><CutToken /></ProtectedRoute>} />


              {/* ── Hall Admin ──────────────────────────────────────────────── */}
              {/* <Route path="/hallAdmin/dashboard" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminDashboard /></ProtectedRoute>} /> */}
              <Route path="/hallAdmin/staff" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminStaff /></ProtectedRoute>} />
              <Route path="/hallAdmin/students" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminStudents /></ProtectedRoute>} />
              <Route path="/hallAdmin/meals" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminMealConfigs /></ProtectedRoute>} />
              <Route path="/hallAdmin/payments" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminPayments /></ProtectedRoute>} />
              <Route path="/hallAdmin/profile" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminProfile /></ProtectedRoute>} />
              <Route path="/hallAdmin/change-password" element={<ProtectedRoute requiredRole="HALL_ADMIN"><HallAdminChangePassword /></ProtectedRoute>} />

              {/* ── Hall Staff ──────────────────────────────────────────────── */}
              <Route path="/hallStaff/dashboard" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallStaffDashboard /></ProtectedRoute>} />
              <Route path="/hallStaff/payments" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallStaffPayments /></ProtectedRoute>} />
              <Route path="/hallStaff/meals" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallStaffMealConfigs /></ProtectedRoute>} />
              <Route path="/hallStaff/summary" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallMealSummary /></ProtectedRoute>} />
              <Route path="/hallStaff/profile" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallStaffProfile /></ProtectedRoute>} />
              <Route path="/hallStaff/change-password" element={<ProtectedRoute requiredRole="HALL_STAFF"><HallStaffChangePassword /></ProtectedRoute>} />
              <Route path="/hallStaff/validate-token" element={<ProtectedRoute requiredRole="HALL_STAFF"><ValidateToken /></ProtectedRoute>} />

              {/* ── Super Admin ─────────────────────────────────────────────── */}
              <Route path="/superAdmin/dashboard" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/superAdmin/halls" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminHalls /></ProtectedRoute>} />
              <Route path="/superAdmin/admins" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminAdmins /></ProtectedRoute>} />
              <Route path="/superAdmin/profile" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminProfile /></ProtectedRoute>} />
              <Route path="/superAdmin/change-password" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminChangePassword /></ProtectedRoute>} />
              <Route path="/superAdmin/students" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminStudents /></ProtectedRoute>} />


            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </PersistQueryClientProvider>
  );
}


