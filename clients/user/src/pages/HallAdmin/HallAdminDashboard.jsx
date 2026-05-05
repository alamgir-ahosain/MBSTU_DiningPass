import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

export const HallAdminDashboard = () => {
    const { userData } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hall Admin Dashboard</h1>
                <p>Welcome, {userData?.firstName || 'Hall Admin'}!</p>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>👥 Hall Staff</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>🎓 Students</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>🍴 Meal Token Issues</h3>
                    <p className="stat-number">0</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Link to="/hallAdmin/create-staff" className="dashboard-card primary-card">
                    <div className="card-icon">➕</div>
                    <h3>Create Hall Staff</h3>
                    <p>Add a new hall staff member</p>
                </Link>

                <Link to="/hallAdmin/staff-list" className="dashboard-card">
                    <div className="card-icon">👥</div>
                    <h3>Manage Staff</h3>
                    <p>View and manage hall staff</p>
                </Link>

                <Link to="/hallAdmin/students" className="dashboard-card">
                    <div className="card-icon">🎓</div>
                    <h3>View Students</h3>
                    <p>View students in your hall</p>
                </Link>

                <div className="dashboard-card info-card">
                    <div className="card-icon">🏢</div>
                    <h3>Hall Information</h3>
                    <p>Hall: <strong>{userData?.hallId || 'N/A'}</strong></p>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Quick Info</h2>
                <div className="info-box">
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
                    <p><strong>Role:</strong> HALL_ADMIN</p>
                    <p><strong>Hall:</strong> {userData?.hallId || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};
