import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { studentAPI } from '../../../services/api';
import './StudentPages.css';



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
            <div className="sp-wrapper">
                <div className="sp-loading">
                    <div className="sp-loading-spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const handleEdit = async () => {
        if (isEditing) {
            try {
                setLoading(true);
                setError('');
                setSuccess('');
                await studentAPI.updateProfile({
                    fullName: editData.fullName,
                    roomNumber: editData.roomNumber
                });
                setSuccess('Profile updated successfully.');
                setIsEditing(false);
                setTimeout(() => window.location.reload(), 1200);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update profile.');
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
        <div className="sp-wrapper">

            {/* Header Banner */}
            <div className="sp-banner">
                <div className="sp-banner-inner">
                    <div className="sp-avatar">
                        {getInitials(userData.fullName)}
                    </div>
                    <div className="sp-banner-info">
                        <h1 className="sp-name">{userData.fullName}</h1>
                        <p className="sp-meta">
                            <span>{userData.studentId || '—'}</span>
                            <span className="sp-meta-divider">·</span>
                            <span>{userData.department || 'Department N/A'}</span>
                            <span className="sp-meta-divider">·</span>
                            <span className={`sp-status-badge ${userData.isActive ? 'active' : 'inactive'}`}>
                                {userData.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="sp-main">
                {error && (
                    <div className="sp-alert sp-alert--error">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="sp-alert sp-alert--success">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {success}
                    </div>
                )}

                <div className="sp-grid">

                    {/* Personal Information */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <h2>Personal Information</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Full Name</dt>
                                <dd>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                            className="sp-input"
                                            placeholder="Enter full name"
                                        />
                                    ) : userData.fullName}
                                </dd>
                            </div>
                            <div className="sp-field">
                                <dt>Email Address</dt>
                                <dd>{userData.email}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Gender</dt>
                                <dd>{userData.gender || '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Academic Information */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12 12 0 01.84 4.272V17m-14 0v-2.15a12 12 0 01.84-4.272L12 14z"/></svg>
                            <h2>Academic Information</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Student ID</dt>
                                <dd className="sp-mono">{userData.studentId || '—'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Department</dt>
                                <dd>{userData.department || '—'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Account Status</dt>
                                <dd>
                                    <span className={`sp-status-inline ${userData.isActive ? 'active' : 'inactive'}`}>
                                        <span className="sp-status-dot" />
                                        {userData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Hall Information */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/></svg>
                            <h2>Hall Information</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Assigned Hall</dt>
                                <dd>{userData.hallShortName || 'Not assigned'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Room Number</dt>
                                <dd>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.roomNumber}
                                            onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })}
                                            className="sp-input"
                                            placeholder="Enter room number"
                                        />
                                    ) : (userData.roomNumber || '—')}
                                </dd>
                            </div>
                        </dl>
                    </div>

                </div>

                {/* Action Bar */}
                <div className="sp-actions">
                    <div className="sp-actions-left">
                        {isEditing ? (
                            <>
                                <button onClick={handleEdit} className="sp-btn sp-btn--primary" disabled={loading}>
                                    {loading ? (
                                        <><span className="sp-btn-spinner" /> Saving...</>
                                    ) : (
                                        <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Save Changes</>
                                    )}
                                </button>
                                <button onClick={handleCancel} className="sp-btn sp-btn--ghost" disabled={loading}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleEdit} className="sp-btn sp-btn--primary">
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                    Edit Profile
                                </button>
                                <Link to="/student/change-password" className="sp-btn sp-btn--secondary">
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                    Change Password
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="sp-actions-right">

                        <button onClick={handleLogout} className="sp-btn sp-btn--danger">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};