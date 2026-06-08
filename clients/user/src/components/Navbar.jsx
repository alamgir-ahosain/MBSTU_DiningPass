
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role, logout, userData } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    const initials = userData
        ? [userData.firstName?.[0], userData.lastName?.[0]].filter(Boolean).join('').toUpperCase()
        : null;

    return (
        <nav className="nb-nav" key={location.pathname}>
            <div className="nb-container">

                {/* Brand */}
                <Link to="/" className="nb-brand">
                    <span className="nb-brand-icon" aria-hidden="true">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="1.8">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                    </span>
                    <span className="nb-brand-text">
                        MBSTU <span className="nb-brand-accent">Dining Pass</span>
                    </span>
                </Link>

                {/* Right side */}
                <div className="nb-right">

                    {/* Desktop links */}
                    <div className="nb-links">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login"   className="nb-link">Login</Link>
                                <Link to="/register" className="nb-link nb-link--cta">Register</Link>
                            </>
                        ) : (
                            <>
                                {role === 'SUPER_ADMIN' && <>
                                    <Link to="/superAdmin/dashboard" className="nb-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/superAdmin/halls"     className="nb-link" onClick={closeMenu}>Halls</Link>
                                    <Link to="/superAdmin/admins"    className="nb-link" onClick={closeMenu}>Admins</Link>
                                    <Link to="/superAdmin/profile"   className="nb-link" onClick={closeMenu}>Profile</Link>
                                </>}

                                {role === 'HALL_ADMIN' && <>
                                    <Link to="/hallAdmin/dashboard" className="nb-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/hallAdmin/students"  className="nb-link" onClick={closeMenu}>Students</Link>
                                    <Link to="/hallAdmin/staff"     className="nb-link" onClick={closeMenu}>Staff</Link>
                                    <Link to="/hallAdmin/meals"     className="nb-link" onClick={closeMenu}>Meals</Link>
                                    <Link to="/hallAdmin/payments"  className="nb-link" onClick={closeMenu}>Payments</Link>
                                    <Link to="/hallAdmin/profile"   className="nb-link" onClick={closeMenu}>Profile</Link>
                                </>}

                                {role === 'HALL_STAFF' && <>
                                    <Link to="/hallStaff/dashboard"       className="nb-link" onClick={closeMenu}>Dashboard</Link>
                                    <Link to="/hallStaff/validate-token"  className="nb-link" onClick={closeMenu}>Validate Token</Link>
                                    <Link to="/hallStaff/meals"           className="nb-link" onClick={closeMenu}>Meals</Link>
                                    <Link to="/hallStaff/payments"        className="nb-link" onClick={closeMenu}>Payments</Link>
                                    <Link to="/hallStaff/profile"         className="nb-link" onClick={closeMenu}>Profile</Link>
                                </>}

                                {role === 'STUDENT' && <>
                                    <Link to="/student/cut-token"  className="nb-link" onClick={closeMenu}>Cut Token</Link>
                                    <Link to="/student/my-tokens"  className="nb-link" onClick={closeMenu}>My Tokens</Link>
                                    <Link to="/student/profile"    className="nb-link" onClick={closeMenu}>Profile</Link>
                                </>}

                                {!['SUPER_ADMIN','HALL_ADMIN','HALL_STAFF','STUDENT'].includes(role) && (
                                    <Link to="/dashboard" className="nb-link" onClick={closeMenu}>Dashboard</Link>
                                )}

                                {/* Avatar + logout */}
                                {initials && (
                                    <div className="nb-avatar" aria-hidden="true">{initials}</div>
                                )}
                                <button className="nb-logout" onClick={handleLogout}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {/* Hamburger (mobile, authenticated only) */}
                    {isAuthenticated && (
                        <button
                            type="button"
                            className={`nb-toggle${menuOpen ? ' nb-toggle--open' : ''}`}
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Toggle navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <span /><span /><span />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile drawer */}
            {isAuthenticated && menuOpen && (
                <div className="nb-drawer">

                    {role === 'SUPER_ADMIN' && <>
                        <Link to="/superAdmin/dashboard" className="nb-drawer-link" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/superAdmin/halls"     className="nb-drawer-link" onClick={closeMenu}>Halls</Link>
                        <Link to="/superAdmin/admins"    className="nb-drawer-link" onClick={closeMenu}>Admins</Link>
                        <Link to="/superAdmin/profile"   className="nb-drawer-link" onClick={closeMenu}>Profile</Link>
                    </>}

                    {role === 'HALL_ADMIN' && <>
                        <Link to="/hallAdmin/dashboard" className="nb-drawer-link" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/hallAdmin/students"  className="nb-drawer-link" onClick={closeMenu}>Students</Link>
                        <Link to="/hallAdmin/staff"     className="nb-drawer-link" onClick={closeMenu}>Staff</Link>
                        <Link to="/hallAdmin/meals"     className="nb-drawer-link" onClick={closeMenu}>Meals</Link>
                        <Link to="/hallAdmin/payments"  className="nb-drawer-link" onClick={closeMenu}>Payments</Link>
                        <Link to="/hallAdmin/profile"   className="nb-drawer-link" onClick={closeMenu}>Profile</Link>
                    </>}

                    {role === 'HALL_STAFF' && <>
                        <Link to="/hallStaff/dashboard"      className="nb-drawer-link" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/hallStaff/validate-token" className="nb-drawer-link" onClick={closeMenu}>Validate Token</Link>
                        <Link to="/hallStaff/meals"          className="nb-drawer-link" onClick={closeMenu}>Meals</Link>
                        <Link to="/hallStaff/payments"       className="nb-drawer-link" onClick={closeMenu}>Payments</Link>
                        <Link to="/hallStaff/profile"        className="nb-drawer-link" onClick={closeMenu}>Profile</Link>
                    </>}

                    {role === 'STUDENT' && <>
                        <Link to="/student/cut-token" className="nb-drawer-link" onClick={closeMenu}>Cut Token</Link>
                        <Link to="/student/my-tokens" className="nb-drawer-link" onClick={closeMenu}>My Tokens</Link>
                        <Link to="/student/profile"   className="nb-drawer-link" onClick={closeMenu}>Profile</Link>
                    </>}

                    {!['SUPER_ADMIN','HALL_ADMIN','HALL_STAFF','STUDENT'].includes(role) && (
                        <Link to="/dashboard" className="nb-drawer-link" onClick={closeMenu}>Dashboard</Link>
                    )}

                    <div className="nb-drawer-divider" />
                    <button className="nb-drawer-logout" onClick={handleLogout}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};