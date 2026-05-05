import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudentDashboard } from '../pages/Student/StudentDashboard';
import { HallAdminDashboard } from '../pages/HallAdmin/HallAdminDashboard';
import { HallStaffDashboard } from '../pages/HallStaff/HallStaffDashboard';
import { SuperAdminDashboard } from '../pages/SuperAdmin/SuperAdminDashboard';

export const RoleDashboard = () => {
    const { role, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Loading dashboard...</h2>
            </div>
        );
    }

    switch (role) {
        case 'STUDENT':
            return <StudentDashboard />;
        case 'HALL_STAFF':
            return <HallStaffDashboard />;
        case 'HALL_ADMIN':
            return <HallAdminDashboard />;
        case 'SUPER_ADMIN':
            return <SuperAdminDashboard />;
        default:
            return <Navigate to="/login" replace />;
    }
};
