import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './LoginPage.css';

export const LoginPage = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.email);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            if      (err.code === 'auth/user-not-found')  setError('User not found. Please register first.');
            else if (err.code === 'auth/wrong-password')  setError('Incorrect password. Please try again.');
            else if (err.code === 'auth/invalid-email')   setError('Invalid email format.');
            else                                          setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lp-page">
            <div className="lp-card">
                <div className="lp-inner">

                    <div className="lp-badge">MBSTU Dining Pass</div>
                    <h1 className="lp-title">Welcome back</h1>
                    <p className="lp-subtitle">Sign in to your student portal account</p>
                    <div className="lp-divider" />

                    {error && <div className="lp-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="lp-field">
                            <label htmlFor="lp-email">Email Address</label>
                            <input
                                id="lp-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="lp-field">
                            <label htmlFor="lp-password">Password</label>
                            <input
                                id="lp-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="lp-btn" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="lp-footer">
                        <p><Link to="/forgot-password">Forgot your password?</Link></p>
                        <p>Don't have an account? <Link to="/register">Register here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
