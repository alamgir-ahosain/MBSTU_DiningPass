import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminPages.css';

export const SuperAdminDashboard = () => {
    const { userData } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                <p>Welcome, {userData?.firstName || 'Super Admin'}!</p>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>🏢 Halls</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>👥 Admins</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>🎓 Students</h3>
                    <p className="stat-number">0</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Link to="/superAdmin/create-hall" className="dashboard-card primary-card">
                    <div className="card-icon">➕</div>
                    <h3>Create Hall</h3>
                    <p>Add a new hall to the system</p>
                </Link>

                <Link to="/superAdmin/halls" className="dashboard-card">
                    <div className="card-icon">🏢</div>
                    <h3>Manage Halls</h3>
                    <p>View and manage all halls</p>
                </Link>

                <Link to="/superAdmin/admins" className="dashboard-card">
                    <div className="card-icon">👥</div>
                    <h3>Manage Admins</h3>
                    <p>Create and manage administrators</p>
                </Link>

                <Link to="/superAdmin/students" className="dashboard-card">
                    <div className="card-icon">🎓</div>
                    <h3>View Students</h3>
                    <p>View all students in the system</p>
                </Link>
            </div>

            <div className="dashboard-section">
                <h2>Quick Info</h2>
                <div className="info-box">
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
                    <p><strong>Role:</strong> SUPER_ADMIN</p>
                </div>
            </div>
        </div>
    );
};
