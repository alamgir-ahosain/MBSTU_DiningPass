import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { studentAPI } from '../../../services/api';
import '../StudentPages.css';

export const StudentProfile = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: userData?.fullName || '',
        roomNumber: userData?.roomNumber || ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!userData) {
        return (
            <div className="page-wrapper">
                <div className="card">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    const handleEdit = async () => {
        if (isEditing) {
            // Save changes
            try {
                setLoading(true);
                setError('');
                setSuccess('');
                
                const updatePayload = {
                    fullName: editData.fullName,
                    roomNumber: editData.roomNumber
                };
                
                await studentAPI.updateProfile(updatePayload);
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                
                // Optionally refresh the page after a delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update profile');
            } finally {
                setLoading(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setEditData({
            fullName: userData?.fullName || '',
            roomNumber: userData?.roomNumber || ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="page-wrapper">
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">My Profile</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">Full Name:</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.fullName}
                                onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                className="profile-item-input"
                            />
                        ) : (
                            <span className="profile-item-value">{userData.fullName}</span>
                        )}
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
                        <span className="profile-item-label">Department:</span>
                        <span className="profile-item-value">{userData.department || 'N/A'}</span>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Hall Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">Hall:</span>
                        <span className="profile-item-value">{userData.hallShortName || 'Not assigned'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Room Number:</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.roomNumber}
                                onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })}
                                className="profile-item-input"
                            />
                        ) : (
                            <span className="profile-item-value">{userData.roomNumber || 'N/A'}</span>
                        )}
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Information</h2>
                    <div className="profile-item">
                        <span className="profile-item-label">Gender:</span>
                        <span className="profile-item-value">{userData.gender || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Status:</span>
                        <span className="profile-item-value">
                            <strong style={{ color: '#27ae60' }}>
                                {userData.isActive ? 'Active' : 'Inactive'}
                            </strong>
                        </span>
                    </div>
                </div>

                <div className="button-group">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleEdit} 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                onClick={handleCancel} 
                                className="btn btn-cancel"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleEdit} 
                                className="btn btn-primary"
                            >
                                Edit Profile
                            </button>
                            <Link to="/student/change-password" className="btn btn-info">
                                Change Password
                            </Link>
                        </>
                    )}
                </div>

                <div className="button-group">
                    <Link to="/student/forgot-password" className="btn btn-secondary">
                        Forgot Password?
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="btn btn-logout"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
