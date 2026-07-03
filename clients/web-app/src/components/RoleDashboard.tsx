import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StudentDashboard } from "../pages/Student/dashboard/StudentDashboard";
import { HallAdminDashboard } from "../pages/HallAdmin/dashboard/HallAdminDashboard";
import { HallStaffDashboard } from "../pages/HallStaff/dashboard/HallStaffDashboard";
import { SuperAdminDashboard } from "../pages/SuperAdmin/dashboard/SuperAdminDashboard";

export const RoleDashboard = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    );
  }

  switch (role) {
    case "STUDENT": return <StudentDashboard />;
    case "HALL_STAFF": return <HallStaffDashboard />;
    case "HALL_ADMIN": return <HallAdminDashboard />;
    case "SUPER_ADMIN": return <SuperAdminDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};