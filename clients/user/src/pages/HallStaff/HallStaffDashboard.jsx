import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HallStaffPages.css';

export const HallStaffDashboard = () => {
    const { userData } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hall Staff Dashboard</h1>
                <p>Welcome, {userData?.firstName || 'Hall Staff'}!</p>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>🎓 Students</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>🍴 Tokens Issued</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                    <h3>📊 Today's Activity</h3>
                    <p className="stat-number">0</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Link to="/hallStaff/students" className="dashboard-card">
                    <div className="card-icon">🎓</div>
                    <h3>View Students</h3>
                    <p>See all students in your hall</p>
                </Link>

                <Link to="/hallStaff/issue-token" className="dashboard-card">
                    <div className="card-icon">🍴</div>
                    <h3>Issue Token</h3>
                    <p>Issue dining tokens to students</p>
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
                    <p><strong>Role:</strong> HALL_STAFF</p>
                </div>
            </div>
        </div>
    );
};
