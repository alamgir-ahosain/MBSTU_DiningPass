import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    MBSTU Dining Pass
                </Link>

                <div className="navbar-menu">
                    {!isAuthenticated ? (
                        <div className="navbar-links">
                            <Link to="/" className="nav-link">
                                Home
                            </Link>
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                            <Link to="/register" className="nav-link">
                                Register
                            </Link>
                        </div>
                    ) : (
                        <div className="navbar-links">
                            <span className="nav-role">
                                Role: <strong>{role}</strong>
                            </span>
                            <Link to="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
