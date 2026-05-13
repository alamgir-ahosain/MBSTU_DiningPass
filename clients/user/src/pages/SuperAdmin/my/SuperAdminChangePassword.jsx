import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebase';
import '../SuperAdminPages.css';

export function SuperAdminChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to change your password');
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);

            setSuccess('Password changed successfully! Redirecting...');
            setTimeout(() => {
                navigate('/superAdmin/profile');
            }, 2000);
        } catch (err) {
            console.error('Super admin change password error:', err);

            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak');
            } else {
                setError(err.message || 'Failed to change password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/profile" className="back-link">← Back to Profile</Link>

            <div className="card">
                <h1 className="page-title">Change Password</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            id="currentPassword"
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter your current password"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter your new password"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Confirm your new password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/superAdmin/profile')}
                            className="btn btn-cancel"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


