import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StudentPages.css';

export const StudentForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Call Firebase password reset endpoint
            const response = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to send reset link');
            }

            setSuccess('Password reset link has been sent to your email. Please check your inbox.');
            setEmail('');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to send password reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/" className="back-link">← Back to Home</Link>

            <div className="card">
                <h1 className="page-title">Forgot Password</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@university.edu"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
                    <p>Remember your password? <Link to="/login" style={{ color: '#3498db', textDecoration: 'none' }}>Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
};

