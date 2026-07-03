import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import './ForgotPasswordPage.css';

export const ForgotPasswordPage = () => {
    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
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
                'Password reset email sent! Check your inbox. ' +
                'You will be redirected to login in 10 seconds…'
            );
            setTimeout(() => navigate('/login'), 10000);
        } catch (err) {
            console.error('Forgot password error:', err);
            if      (err.code === 'auth/user-not-found')   setError('No account found with this email address.');
            else if (err.code === 'auth/invalid-email')    setError('Invalid email format.');
            else if (err.code === 'auth/too-many-requests')setError('Too many reset requests. Please try again later.');
            else                                           setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fp-page">
            <div className="fp-card">
                <div className="fp-inner">

                    <div className="fp-badge">MBSTU Dining Pass</div>
                    <h1 className="fp-title">Reset Password</h1>
                    <p className="fp-subtitle">
                        Enter your registered email and we'll send a reset link.
                    </p>
                    <div className="fp-divider" />

                    {error   && <div className="fp-error">{error}</div>}
                    {success && <div className="fp-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="fp-field">
                            <label htmlFor="fp-email">Email Address</label>
                            <input
                                id="fp-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="ce21012@mbstu.ac.bd"
                                disabled={loading || !!success}
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="fp-btn"
                            disabled={loading || !!success}
                        >
                            {loading ? 'Sending…' : 'Send Reset Email'}
                        </button>
                    </form>

                    <div className="fp-footer">
                        <p><Link to="/login">← Back to Login</Link></p>
                        <p>Don't have an account? <Link to="/register">Register here</Link></p>
                    </div>

                </div>
            </div>
        </div>
    );
};
