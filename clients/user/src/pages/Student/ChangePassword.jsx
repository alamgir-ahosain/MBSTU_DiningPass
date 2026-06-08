

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import './ChangePassword.css';

export const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from your current password.');
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to change your password.');
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);

            setSuccess('Password changed successfully! Redirecting…');
            setTimeout(() => navigate('/student/profile'), 2000);
        } catch (err) {
            console.error('Change password error:', err);
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak.');
            } else {
                setError(err.message || 'Failed to change password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cp-wrapper">

            {/* ── Banner ── */}
            <div className="cp-banner">
                <div className="cp-banner-inner">
                    <div className="cp-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="cp-banner-title">Change Password</h1>
                        <p className="cp-banner-sub">
                            Update your account password securely.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="cp-main">
                <div className="cp-card">

                    <div className="cp-card-strip" />

                    <div className="cp-card-body">

                        {/* Alerts */}
                        {error && (
                            <div className="cp-alert cp-alert--error">
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8"  x2="12"    y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="cp-alert cp-alert--success">
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                                {success}
                            </div>
                        )}

                        <form className="cp-form" onSubmit={handleSubmit} noValidate>

                            {/* Current password */}
                            <div className="cp-field-group">
                                <label className="cp-label" htmlFor="currentPassword">
                                    Current Password
                                </label>
                                <div className="cp-input-wrap">
                                    <span className="cp-input-icon" aria-hidden="true">
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="currentPassword"
                                        className="cp-input"
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                        required
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            {/* New password */}
                            <div className="cp-field-group">
                                <label className="cp-label" htmlFor="newPassword">
                                    New Password
                                </label>
                                <div className="cp-input-wrap">
                                    <span className="cp-input-icon" aria-hidden="true">
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="newPassword"
                                        className="cp-input"
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 characters"
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <p className="cp-hint">
                                    Must be at least 6 characters and different from your current password.
                                </p>
                            </div>

                            {/* Confirm password */}
                            <div className="cp-field-group">
                                <label className="cp-label" htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>
                                <div className="cp-input-wrap">
                                    <span className="cp-input-icon" aria-hidden="true">
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </span>
                                    <input
                                        id="confirmPassword"
                                        className="cp-input"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your new password"
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="cp-actions">
                                <button
                                    type="submit"
                                    className="cp-btn cp-btn--primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="cp-spinner" aria-hidden="true" />
                                            Updating…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M5 13l4 4L19 7"/>
                                            </svg>
                                            Update Password
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="cp-btn cp-btn--cancel"
                                    onClick={() => navigate('/student/profile')}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};