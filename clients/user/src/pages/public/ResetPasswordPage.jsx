import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase';
import './PublicPages.css';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validating, setValidating] = useState(true);
    const [isValidCode, setIsValidCode] = useState(false);
    const navigate = useNavigate();

    // Get reset code from URL query parameters
    // Firebase sends this as 'oobCode' parameter in the reset email link
    const resetCode = searchParams.get('oobCode');

    // Validate the reset code when component mounts
    useEffect(() => {
        if (!resetCode) {
            setError('Invalid reset link. Please request a new password reset email.');
            setValidating(false);
            return;
        }

        const validateCode = async () => {
            try {
                // Verify the reset code is valid
                await verifyPasswordResetCode(auth, resetCode);
                setIsValidCode(true);
                setValidating(false);
            } catch (err) {
                console.error('Invalid reset code:', err);
                setError('This password reset link is invalid or has expired. Please request a new one.');
                setValidating(false);
            }
        };

        validateCode();
    }, [resetCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Confirm the password reset
            await confirmPasswordReset(auth, resetCode, newPassword);

            setSuccess(
                'Password reset successful! Your password has been updated. ' +
                'You will be redirected to login in 2 seconds...'
            );

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Password reset error:', err);

            if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else if (err.code === 'auth/expired-action-code') {
                setError('This password reset link has expired. Please request a new one.');
            } else if (err.code === 'auth/invalid-action-code') {
                setError('Invalid password reset link. Please request a new one.');
            } else {
                setError(err.message || 'Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="form-container">
                <h1>Validating Reset Link</h1>
                <p className="form-description">Please wait while we validate your reset link...</p>
            </div>
        );
    }

    if (!isValidCode) {
        return (
            <div className="form-container">
                <h1>Invalid Reset Link</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="form-footer">
                    <p>
                        <Link to="/login">Back to Login</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password">Request a new reset email</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1>Reset Your Password</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <p className="form-description">
                    Enter your new password below. Make sure it's at least 6 characters long.
                </p>

                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter your new password"
                        minLength="6"
                        disabled={loading || success}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your new password"
                        minLength="6"
                        disabled={loading || success}
                    />
                </div>

                <button
                    type="submit"
                    className="form-button"
                    disabled={loading || success}
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};
