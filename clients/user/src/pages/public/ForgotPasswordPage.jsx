import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import './PublicPages.css';

export const ForgotPasswordPage = () => {
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
            // Send password reset email via Firebase
            await sendPasswordResetEmail(auth, email);

            setSuccess(
                'Password reset email sent! Check your inbox for a link to reset your password. ' +
                'You will be redirected to login in 12 seconds...'
            );

            // Redirect to login after 12 seconds
            setTimeout(() => {
                navigate('/login');
            }, 10000);
        } catch (err) {
            console.error('Forgot password error:', err);

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
        <div className="form-container">
            <h1>Forgot Password</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <p className="form-description">
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

                <button
                    type="submit"
                    className="form-button"
                    disabled={loading || success}
                >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    <Link to="/login">Back to Login</Link>
                </p>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};
