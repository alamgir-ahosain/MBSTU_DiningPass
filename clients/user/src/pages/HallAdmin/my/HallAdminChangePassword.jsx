import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import '../HallAdminPages.css';

export const HallAdminChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user?.email) {
                setError('No authenticated user found. Please login again.');
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);

            setSuccess('Password changed successfully. Redirecting to profile...');
            setTimeout(() => navigate('/hallAdmin/profile'), 1500);
        } catch (err) {
            console.error('Failed to change password', err);
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect.');
            } else {
                setError(err.message || 'Failed to change password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/profile" className="back-link">← Back to My Profile</Link>

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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
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
                            minLength={6}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button type="button" className="btn btn-cancel" onClick={() => navigate('/hallAdmin/profile')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

