import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './PublicPages.css';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.email);

            // Navigate to dashboard - AuthContext will handle role fetching
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);

            // Show user-friendly error messages
            if (err.code === 'auth/user-not-found') {
                setError('User not found. Please register first.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h1>Login</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="form-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    <Link to="/forgot-password">Forgot your password?</Link>
                </p>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};
