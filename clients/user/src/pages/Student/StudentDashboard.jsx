
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';


export const StudentDashboard = () => {
    const { userData } = useAuth();

    const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || 'Student';
    const initials = [userData?.firstName?.[0], userData?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'S';

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <div className="sd-wrapper">

            {/* ── Banner ── */}
            <div className="sd-banner">
                <div className="sd-banner-inner">
                    <div className="sd-avatar" aria-hidden="true">{getInitials(userData.fullName)}</div>
                    <div className="sd-banner-text">
                        <p className="sd-welcome">Welcome back,</p>
                        <h1 className="sd-name">{userData?.fullName || userData?.roll || '—'}</h1>

                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="sd-main">

                {/* ── Student info strip ── */}
                <div className="sd-info-strip">
                    <div className="sd-info-item">
                        <span className="sd-info-label">Student ID</span>
                        <span className="sd-info-value">{userData?.studentId || userData?.roll || '—'}</span>
                    </div>
                    <div className="sd-info-divider" />
                    <div className="sd-info-divider" />
                    <div className="sd-info-item">
                        <span className="sd-info-label">Hall</span>
                        <span className="sd-info-value">{userData?.hallShortName || '—'}</span>
                    </div>
                    <div className="sd-info-divider" />
                    <div className="sd-info-item">
                        <span className="sd-info-label">Email</span>
                        <span className="sd-info-value sd-info-email">{userData?.email || '—'}</span>
                    </div>
                </div>

                {/* ── Section heading ── */}
                <h2 className="sd-section-title">Quick Actions</h2>

                {/* ── Action cards ── */}
                <div className="sd-grid">

                    {/* Cut Token */}
                    <Link to="/student/cut-token" className="sd-card sd-card--primary">
                        <div className="sd-card-strip" />
                        <div className="sd-card-body">
                            <div className="sd-card-icon sd-card-icon--maroon" aria-hidden="true">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="1.6">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                            </div>
                            <div className="sd-card-content">
                                <h3 className="sd-card-title">Cut Token</h3>
                                <p className="sd-card-desc">
                                    Purchase a dining token for lunch or dinner via bKash.
                                </p>
                            </div>
                            <div className="sd-card-arrow" aria-hidden="true">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* My Tokens */}
                    <Link to="/student/my-tokens" className="sd-card">
                        <div className="sd-card-strip sd-card-strip--gold" />
                        <div className="sd-card-body">
                            <div className="sd-card-icon sd-card-icon--gold" aria-hidden="true">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="1.6">
                                    <path d="M20 12V22H4V12"/>
                                    <path d="M22 7H2v5h20V7z"/>
                                    <path d="M12 22V7"/>
                                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                                </svg>
                            </div>
                            <div className="sd-card-content">
                                <h3 className="sd-card-title">My Tokens</h3>
                                <p className="sd-card-desc">
                                    View all your issued dining tokens and their status.
                                </p>
                            </div>
                            <div className="sd-card-arrow" aria-hidden="true">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Profile */}
                    <Link to="/student/profile" className="sd-card">
                        <div className="sd-card-strip sd-card-strip--neutral" />
                        <div className="sd-card-body">
                            <div className="sd-card-icon sd-card-icon--neutral" aria-hidden="true">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="1.6">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="sd-card-content">
                                <h3 className="sd-card-title">My Profile</h3>
                                <p className="sd-card-desc">
                                    View and update your personal account information.
                                </p>
                            </div>
                            <div className="sd-card-arrow" aria-hidden="true">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </div>
                        </div>
                    </Link>

                </div>

                {/* ── Info note ── */}
                <div className="sd-note">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8"  x2="12"    y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Tokens are issued instantly after a successful payment.
                    Contact your hall administration for any discrepancies.
                </div>

            </div>
        </div>
    );
};