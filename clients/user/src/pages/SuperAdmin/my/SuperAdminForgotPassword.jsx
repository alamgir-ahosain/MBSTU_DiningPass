import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import '../SuperAdminPages.css';

export const SuperAdminForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);

            setSuccess(
                'Password reset email sent! Check your inbox for a link to reset your password. ' +
                'You will be redirected to your profile in 10 seconds...'
            );

            setTimeout(() => {
                navigate('/superAdmin/profile');
            }, 10000);
        } catch (err) {
            console.error('Super admin forgot password error:', err);

            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many reset requests. Please try again later.');
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/profile" className="back-link">← Back to Profile</Link>

            <div className="card">
                <h1 className="page-title">Forgot Password</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <p className="detail-subtitle" style={{ marginBottom: '1rem' }}>
                        Enter your registered email to get a password reset link.
                    </p>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading || success}>
                            {loading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={() => navigate('/superAdmin/profile')}
                            disabled={loading || success}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="form-footer" style={{ marginTop: '1rem' }}>
                    <p>
                        <Link to="/superAdmin/profile">Back to Profile</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

