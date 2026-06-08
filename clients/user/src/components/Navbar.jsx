import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar" key={location.pathname}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    MBSTU Dining Pass
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated && (
                        <button
                            type="button"
                            className="menu-toggle"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label="Toggle navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    )}

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
                        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                            {role === 'SUPER_ADMIN' ? (
                                <>
                                    <Link to="/superAdmin/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/superAdmin/halls" className="nav-link" onClick={closeMenu}>Manage Halls</Link>
                                    <Link to="/superAdmin/admins" className="nav-link" onClick={closeMenu}>Manage Hall Admins</Link>
                                    <Link to="/superAdmin/profile" className="nav-link" onClick={closeMenu}>My Profile</Link>
                                </>
                            ) : role === 'HALL_ADMIN' ? (
                                <>
                                    <Link to="/hallAdmin/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/hallAdmin/students" className="nav-link" onClick={closeMenu}>Students</Link>
                                    <Link to="/hallAdmin/staff" className="nav-link" onClick={closeMenu}>Hall Staff</Link>
                                    <Link to="/hallAdmin/meals" className="nav-link" onClick={closeMenu}>Meals</Link>
                                    <Link to="/hallAdmin/payments" className="nav-link" onClick={closeMenu}>Payments</Link>
                                    <Link to="/hallAdmin/profile" className="nav-link" onClick={closeMenu}>My Profile</Link>
                                </>
                            ) : role === 'HALL_STAFF' ? (
                                <>
                                    <Link to="/hallStaff/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/hallStaff/payments" className="nav-link" onClick={closeMenu}>Payments</Link>
                                    <Link to="/hallStaff/meals" className="nav-link" onClick={closeMenu}>Meals</Link>
                                    <Link to="/hallStaff/validate-token" className="nav-link">Validate Token</Link>
                                    <Link to="/hallStaff/profile" className="nav-link" onClick={closeMenu}>My Profile</Link>
                                </>
                            ) : role === 'STUDENT' ? (
                                <>
                                    <Link to="/student/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/student/cut-token" className="nav-link" onClick={closeMenu}>Cut Token</Link>
                                    <Link to="/student/payment-history" className="nav-link" onClick={closeMenu}>Payment History</Link>
                                    <Link to="/student/my-tokens" className="nav-link" onClick={closeMenu}>My Tokens</Link>
                                    <Link to="/student/profile" className="nav-link" onClick={closeMenu}>My Profile</Link>
                                </>
                            ) : (
                                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                                    Dashboard
                                </Link>
                            )}
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
