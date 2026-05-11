import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const SuperAdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getProfile();
                setProfile(response.data);
            } catch (err) {
                console.error('Fetch super admin profile error:', err);
                setError('Failed to load my profile. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <div className="detail-header">
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>My Profile</h1>
                        <p className="detail-subtitle">View your Super Admin account details</p>
                    </div>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading profile...</p>
                    </div>
                ) : profile ? (
                    <>
                        <div className="detail-grid">
                            <div className="detail-card">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{profile.fullName || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{profile.email || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{profile.phone || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{profile.role || 'SUPER_ADMIN'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Hall</span>
                                <span className="detail-value">{profile.hallShortName || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Status</span>
                                <span className={`badge ${profile.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                    {profile.isActive ? 'Active' : 'Suspended'}
                                </span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Created At</span>
                                <span className="detail-value">{profile.createdAt || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Updated At</span>
                                <span className="detail-value">{profile.updatedAt || '-'}</span>
                            </div>
                        </div>

                        <div className="profile-security-section">
                            <h2>Security</h2>
                            <p className="detail-subtitle">Manage password and account recovery from here.</p>
                            <div className="button-group profile-actions">
                                <Link to="/superAdmin/change-password" className="btn btn-primary">
                                    Change Password
                                </Link>
                                <Link to="/superAdmin/forgot-password" className="btn btn-cancel">
                                    Forgot Password
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <h3>Profile not found</h3>
                        <p>We couldn’t load your Super Admin profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


