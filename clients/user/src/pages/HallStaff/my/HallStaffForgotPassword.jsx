import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import '../HallStaffPages.css';

export const HallStaffForgotPassword = () => {
    const [email, setEmail] = useState(auth.currentUser?.email || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Password reset email sent. Please check your inbox.');
        } catch (err) {
            console.error('Failed to send password reset email', err);
            setError(err.message || 'Failed to send password reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/profile" className="back-link">← Back to My Profile</Link>

            <div className="card">
                <h1 className="page-title">Forgot Password</h1>
                <p className="detail-subtitle">Send a Firebase password reset link to your account email.</p>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

