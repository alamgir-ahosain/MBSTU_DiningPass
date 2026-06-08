

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

const FEATURES = [
    {
        icon: (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
        title: 'Student Portal',
        desc:  'Purchase dining tokens via bKash, view your token history, and manage your profile — all in one place.',
        accent: 'maroon',
    },
    {
        icon: (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
            </svg>
        ),
        title: 'Hall Staff Management',
        desc:  'Validate dining tokens at the gate, track student meal records, and manage daily dining operations.',
        accent: 'gold',
    },
    {
        icon: (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
        ),
        title: 'Hall Admin Dashboard',
        desc:  'Configure meal schedules, set pricing, manage hall staff accounts, and monitor token statistics.',
        accent: 'neutral',
    },
    {
        icon: (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
        ),
        title: 'Super Admin Control',
        desc:  'System-wide oversight — create halls, assign admins, and access full platform analytics.',
        accent: 'maroon',
    },
];

export const HomePage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="hp-wrapper">

            {/* ── Hero ── */}
            <section className="hp-hero">
                <div className="hp-hero-inner">

                    <div className="hp-hero-badge">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        MBSTU Official Dining System
                    </div>

                    <h1 className="hp-hero-title">
                        MBSTU&nbsp;<span className="hp-hero-accent">Dining Pass</span>
                    </h1>

                    <p className="hp-hero-sub">
                        A smart, cashless token management system for Mawlana Bhashani Science and
                        Technology University residential halls — powered by bKash instant payment.
                    </p>

                    <div className="hp-hero-actions">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="hp-btn hp-btn--primary">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    Student Login
                                </Link>
                                <Link to="/register" className="hp-btn hp-btn--outline">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <line x1="19" y1="8" x2="19" y2="14"/>
                                        <line x1="22" y1="11" x2="16" y2="11"/>
                                    </svg>
                                    Register as Student
                                </Link>
                            </>
                        ) : (
                            <Link to="/dashboard" className="hp-btn hp-btn--primary">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                                </svg>
                                Go to Dashboard
                            </Link>
                        )}
                    </div>

                    {/* ── Quick stats ── */}
                    <div className="hp-stats">
                        <div className="hp-stat">
                            <span className="hp-stat-num">bKash</span>
                            <span className="hp-stat-label">Instant Payment</span>
                        </div>
                        <div className="hp-stat-divider" />
                        <div className="hp-stat">
                            <span className="hp-stat-num">24 / 7</span>
                            <span className="hp-stat-label">Token Access</span>
                        </div>
                        <div className="hp-stat-divider" />
                        <div className="hp-stat">
                            <span className="hp-stat-num">100%</span>
                            <span className="hp-stat-label">Cashless</span>
                        </div>
                    </div>
                </div>

                {/* ── Decorative arc ── */}
                <div className="hp-hero-arc" aria-hidden="true" />
            </section>

            {/* ── Features ── */}
            <section className="hp-features">
                <div className="hp-features-inner">

                    <div className="hp-section-head">
                        <h2 className="hp-section-title">Platform Features</h2>
                        <p className="hp-section-sub">
                            Everything needed to run a smooth, modern hall dining operation.
                        </p>
                    </div>

                    <div className="hp-feature-grid">
                        {FEATURES.map((f) => (
                            <div key={f.title} className={`hp-feature-card hp-feature-card--${f.accent}`}>
                                <div className={`hp-feature-icon hp-feature-icon--${f.accent}`}
                                     aria-hidden="true">
                                    {f.icon}
                                </div>
                                <h3 className="hp-feature-title">{f.title}</h3>
                                <p className="hp-feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="hp-how">
                <div className="hp-how-inner">
                    <div className="hp-section-head">
                        <h2 className="hp-section-title">How It Works</h2>
                        <p className="hp-section-sub">Three simple steps to get your dining token.</p>
                    </div>

                    <div className="hp-steps">
                        {[
                            {
                                num: '01',
                                title: 'Register & Log In',
                                desc:  'Create your student account with your university ID and hall details.',
                                icon: (
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="1.8">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <line x1="19" y1="8" x2="19" y2="14"/>
                                        <line x1="22" y1="11" x2="16" y2="11"/>
                                    </svg>
                                ),
                            },
                            {
                                num: '02',
                                title: 'Select a Meal',
                                desc:  'Browse available meals, pick your date and type — Lunch, Dinner, or both.',
                                icon: (
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8"  y1="2" x2="8"  y2="6"/>
                                        <line x1="3"  y1="10" x2="21" y2="10"/>
                                    </svg>
                                ),
                            },
                            {
                                num: '03',
                                title: 'Pay via bKash',
                                desc:  'Complete payment through bKash — your token is issued instantly.',
                                icon: (
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth="1.8">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                        <line x1="1" y1="10" x2="23" y2="10"/>
                                    </svg>
                                ),
                            },
                        ].map((step, i, arr) => (
                            <div key={step.num} className="hp-step-wrap">
                                <div className="hp-step">
                                    <div className="hp-step-num">{step.num}</div>
                                    <div className="hp-step-icon" aria-hidden="true">{step.icon}</div>
                                    <h3 className="hp-step-title">{step.title}</h3>
                                    <p className="hp-step-desc">{step.desc}</p>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hp-step-connector" aria-hidden="true">
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12"/>
                                            <polyline points="12 5 19 12 12 19"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            {!isAuthenticated && (
                <section className="hp-cta">
                    <div className="hp-cta-inner">
                        <h2 className="hp-cta-title">Ready to get started?</h2>
                        <p className="hp-cta-sub">
                            Join the cashless dining experience at MBSTU.
                        </p>
                        <div className="hp-hero-actions">
                            <Link to="/register" className="hp-btn hp-btn--cta">
                                Register Now
                            </Link>
                            <Link to="/login" className="hp-btn hp-btn--cta-outline">
                                Login
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Footer ── */}
            <footer className="hp-footer">
                <p>© {new Date().getFullYear()} MBSTU Dining Pass System · Mawlana Bhashani Science and Technology University</p>
            </footer>
        </div>
    );
};