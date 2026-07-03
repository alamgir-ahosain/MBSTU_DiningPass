import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { hallStaffAPI } from '../../../services/api';
import { formatDateTimeParts } from '../../../utils/formatDateTime';
import '../../Student/profile/StudentPages.css'


export const HallStaffProfile = () => {
    const { logout } = useAuth();
    const navigate   = useNavigate();

    const [profile,  setProfile]  = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '' });
    const [loading,  setLoading]  = useState(true);
    const [isEditing,setIsEditing]= useState(false);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');

    /* ── helpers ── */
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const renderDateTime = (value) => {
        const { date, time } = formatDateTimeParts(value);
        if (date === '-' && time === '-') return '—';
        return `${date}${time && time !== '-' ? '  ·  ' + time : ''}`;
    };

    // ✅ Derive base path from role
    const getBasePath = (role) => {
        if (!role) return '/hallStaff';
        return role === 'HALL_ADMIN' ? '/hallAdmin' : '/hallStaff';
    };

    /* ── data ── */
    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await hallStaffAPI.getMyProfile();
            const data = res.data;
            setProfile(data);
            setFormData({
                fullName: data?.fullName || '',
                phone:    data?.phone    || '',
            });
        } catch (err) {
            setError('Failed to load profile. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    /* ── edit ── */
    const handleEdit = () => {
        setError('');
        setSuccess('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({ fullName: profile?.fullName || '', phone: profile?.phone || '' });
        setIsEditing(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await hallStaffAPI.updateMyProfile(formData);
            setSuccess('Profile updated successfully.');
            setIsEditing(false);
            await loadProfile();
        } catch (err) {
            setError('Failed to update profile. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    /* ── loading ── */
    if (loading) return (
        <div className="sp-wrapper">
            <div className="sp-loading">
                <div className="sp-loading-spinner" />
                <p>Loading profile…</p>
            </div>
        </div>
    );

    /* ── not found ── */
    if (!profile) return (
        <div className="sp-wrapper">
            <div className="sp-loading">
                <p>Profile not found.</p>
            </div>
        </div>
    );

    // ✅ Compute once after profile is loaded
    const basePath = getBasePath(profile.role);

    /* ── render ── */
    return (
        <div className="sp-wrapper">

            {/* ── Banner ── */}
            <div className="sp-banner">
                <div className="sp-banner-inner">
                    <div className="sp-avatar">
                        {getInitials(profile.fullName)}
                    </div>
                    <div className="sp-banner-info">
                        <h1 className="sp-name">{profile.fullName || '—'}</h1>
                        <p className="sp-meta">
                            <span>{profile.role || 'HALL_STAFF'}</span>
                            <span className="sp-meta-divider">·</span>
                            <span>{profile.hallShortName || 'Hall N/A'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="sp-main">

                {error && (
                    <div className="sp-alert sp-alert--error">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="sp-alert sp-alert--success">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {success}
                    </div>
                )}

                <div className="sp-grid">

                    {/* ── Personal Information ── */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <h2>Personal Information</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Full Name</dt>
                                <dd>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                                            className="sp-input"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    ) : (profile.fullName || '—')}
                                </dd>
                            </div>
                            <div className="sp-field">
                                <dt>Email Address</dt>
                                <dd>{profile.email || '—'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Phone</dt>
                                <dd>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                            className="sp-input"
                                            placeholder="e.g. 01XXXXXXXXX"
                                        />
                                    ) : (profile.phone || '—')}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* ── Staff Information ── */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <rect x="2" y="7" width="20" height="14" rx="2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                                <line x1="12" y1="12" x2="12" y2="16"/>
                                <line x1="10" y1="14" x2="14" y2="14"/>
                            </svg>
                            {/* ✅ Role-aware card title */}
                            <h2>{profile.role === 'HALL_ADMIN' ? 'Admin Information' : 'Staff Information'}</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Role</dt>
                                <dd className="sp-mono">{profile.role || 'HALL_STAFF'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Assigned Hall</dt>
                                <dd>{profile.hallShortName || '—'}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Account Status</dt>
                                <dd>
                                    <span className={`sp-status-inline ${profile.isActive ? 'active' : 'inactive'}`}>
                                        <span className="sp-status-dot" />
                                        {profile.isActive ? 'Active' : 'Suspended'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* ── Account Activity ── */}
                    <div className="sp-card">
                        <div className="sp-card-header">
                            <svg className="sp-card-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="12 6 12 12 16 14"/>
                            </svg>
                            <h2>Account Activity</h2>
                        </div>
                        <dl className="sp-fields">
                            <div className="sp-field">
                                <dt>Created At</dt>
                                <dd>{renderDateTime(profile.createdAt)}</dd>
                            </div>
                            <div className="sp-field">
                                <dt>Last Updated</dt>
                                <dd>{renderDateTime(profile.updatedAt)}</dd>
                            </div>
                        </dl>
                    </div>

                </div>

                {/* ── Action Bar ── */}
                <div className="sp-actions">
                    <div className="sp-actions-left">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="sp-btn sp-btn--primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <><span className="sp-btn-spinner" /> Saving…</>
                                    ) : (
                                        <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Save Changes</>
                                    )}
                                </button>
                                <button type="button" className="sp-btn sp-btn--ghost" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" className="sp-btn sp-btn--primary" onClick={handleEdit}>
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit Profile
                                </button>
                                {/* ✅ Role-based Change Password route */}
                                <Link to={`${basePath}/change-password`} className="sp-btn sp-btn--secondary">
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                                    </svg>
                                    Change Password
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="sp-actions-right">
                        <button type="button" className="sp-btn sp-btn--danger" onClick={handleLogout}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};