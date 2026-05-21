import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StudentPages.css';

export const StudentDashboard = () => {
    const { userData } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Student Dashboard</h1>
                <p>Welcome, {userData?.firstName || 'Student'}!</p>
            </div>

            <div className="dashboard-grid">
                <Link to="/student/profile" className="dashboard-card">
                    <div className="card-icon">👤</div>
                    <h3>View Profile</h3>
                    <p>View and manage your profile information</p>
                </Link>

                <Link to="/student/change-password" className="dashboard-card">
                    <div className="card-icon">🔐</div>
                    <h3>Change Password</h3>
                    <p>Update your account password</p>
                </Link>

                <div className="dashboard-card info-card">
                    <div className="card-icon">🍴</div>
                    <h3>Dining Pass Status</h3>
                    <p>Current pass status: <strong>Active</strong></p>
                </div>

                <div className="dashboard-card info-card">
                    <div className="card-icon">🏢</div>
                    <h3>Hall Information</h3>
                    <p>Hall: <strong>{userData?.hallId || 'Not assigned'}</strong></p>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Quick Info</h2>
                <div className="info-box">
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Student ID:</strong> {userData?.studentId || 'N/A'}</p>
                    <p><strong>Name:</strong> {userData?.firstName} {userData?.lastName}</p>
                    <p><strong>Role:</strong> STUDENT</p>
                </div>
            </div>
        </div>
    );
};
