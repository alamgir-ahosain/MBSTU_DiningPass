import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallStaffAPI } from '../../../services/api';
import { formatDateTimeParts } from '../../../utils/formatDateTime';
import '../HallStaffPages.css';

export const HallStaffProfile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const renderDateTime = (value) => {
        const { date, time } = formatDateTimeParts(value);
        if (date === '-' && time === '-') return '-';
        return (
            <div className="datetime-display">
                <span>{date}</span>
                {time && <span>{time}</span>}
            </div>
        );
    };

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await hallStaffAPI.getMyProfile();
            const profileData = response.data;
            setProfile(profileData);
            setFormData({
                fullName: profileData?.fullName || '',
                phone: profileData?.phone || '',
            });
        } catch (err) {
            console.error('Failed to load hall staff profile', err);
            setError('Failed to load profile. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await hallStaffAPI.updateMyProfile(formData);
            setSuccess('Profile updated successfully.');
            await loadProfile();
        } catch (err) {
            console.error('Failed to update hall staff profile', err);
            setError('Failed to update profile. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">My Profile</h1>
                <p className="detail-subtitle">Profile info, password update, and recovery settings.</p>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                {loading ? (
                    <div className="empty-state"><p>Loading profile...</p></div>
                ) : profile ? (
                    <>
                        <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
                            <div className="detail-card">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{profile.email || '-'}</span>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{profile.role || 'HALL_STAFF'}</span>
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
                                <div className="detail-value">{renderDateTime(profile.createdAt)}</div>
                            </div>
                            <div className="detail-card">
                                <span className="detail-label">Updated At</span>
                                <div className="detail-value">{renderDateTime(profile.updatedAt)}</div>
                            </div>
                        </div>

                        <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Update Profile Info</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>

                        <div className="profile-security-section">
                            <h2>Security</h2>
                            <p className="detail-subtitle">Manage account password and recovery options.</p>
                            <div className="button-group profile-actions">
                                <Link to="/hallStaff/change-password" className="btn btn-primary">Change Password</Link>
                                <Link to="/hallStaff/forgot-password" className="btn btn-cancel">Forgot Password</Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <h3>Profile not found</h3>
                        <p>Could not load Hall Staff profile details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


