import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StudentPages.css';

export const ViewProfile = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();

    if (!userData) {
        return (
            <div className="page-wrapper">
                <div className="card">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">My Profile</h1>

                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">First Name:</span>
                        <span className="profile-item-value">{userData.firstName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Last Name:</span>
                        <span className="profile-item-value">{userData.lastName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Email:</span>
                        <span className="profile-item-value">{userData.email}</span>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Academic Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">Student ID:</span>
                        <span className="profile-item-value">{userData.studentId || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Hall ID:</span>
                        <span className="profile-item-value">{userData.hallId || 'Not assigned'}</span>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">Role:</span>
                        <span className="profile-item-value">STUDENT</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Status:</span>
                        <span className="profile-item-value">
                            <strong style={{ color: '#27ae60' }}>Active</strong>
                        </span>
                    </div>
                </div>

                <div className="button-group">
                    <Link to="/student/change-password" className="btn btn-primary">
                        Change Password
                    </Link>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-cancel">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
