
/**
 * The backend callback controller redirects the student's browser here after
 * a successful bKash payment and execute.
 *
 * URL: /payment/success?paymentID=xxx&trxID=yyy&status=COMPLETED
 *
 * This page is PUBLIC (no ProtectedRoute) because bKash redirects the browser
 * here directly — there is no JWT in this navigation.
 * The student is still logged in (their JWT is in memory / localStorage),
 * so the "View My Tokens" link works fine once they navigate back.
 */


import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import './PaymentSuccessPage.css';

/**
 * The backend callback controller redirects the student's browser here after
 * a successful bKash payment and execute.
 *
 * URL: /payment/success?paymentID=xxx&trxID=yyy&status=COMPLETED
 *
 * This page is PUBLIC (no ProtectedRoute) because bKash redirects the browser
 * here directly — there is no JWT in this navigation.
 * The student is still logged in (their JWT is in memory / localStorage),
 * so the "View My Tokens" link works fine once they navigate back.
 */

const REDIRECT_SECONDS = 5;
const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

export function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();

    const [redirectCancelled, setRedirectCancelled] = useState(false);
    const [secondsLeft,       setSecondsLeft]        = useState(REDIRECT_SECONDS);

    const timerRef = useRef(null);

    const paymentID = searchParams.get('paymentID') || '—';
    const trxID     = searchParams.get('trxID')     || '—';
    const status    = searchParams.get('status')    || 'COMPLETED';

    /* ── Countdown auto-redirect ─────────────────────────────────── */
    useEffect(() => {
        if (redirectCancelled) return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    navigate('/student/my-tokens');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [redirectCancelled, navigate]);

    const handleCancelRedirect = () => {
        clearInterval(timerRef.current);
        setRedirectCancelled(true);
    };

    /* ── Ring progress ───────────────────────────────────────────── */
    const dashOffset = CIRCUMFERENCE * (1 - secondsLeft / REDIRECT_SECONDS);

    return (
        <div className="ps-wrapper">

            {/* ── Banner ── */}
            <div className="ps-banner">
                <div className="ps-banner-inner">
                    <div className="ps-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="ps-banner-title">Payment Successful</h1>
                        <p className="ps-banner-sub">
                            Your bKash payment was confirmed — token issued automatically.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="ps-main">
                <div className="ps-card">

                    {/* Colour strip — green for success */}
                    <div className="ps-card-strip" />

                    <div className="ps-card-body">

                        {/* Icon */}
                        <div className="ps-icon-circle" aria-hidden="true">
                            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth="1.6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>

                        <h2 className="ps-title">Payment Successful</h2>

                        {/* Success message */}
                        <div className="ps-msg ps-msg--success">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            Your dining token has been issued to your account.
                        </div>

                        {/* Payment details */}
                        <div className="ps-summary">
                            <h3 className="ps-summary-title">Payment Details</h3>

                            <div className="ps-summary-row">
                                <span>Status</span>
                                <strong className="ps-status-badge">{status}</strong>
                            </div>

                            <div className="ps-summary-row ps-summary-row--total">
                                <span>Transaction ID</span>
                                <strong className="ps-mono">{trxID}</strong>
                            </div>
                        </div>



                        {/* ── Countdown ring ── */}
                        {!redirectCancelled && (
                            <div className="ps-countdown">
                                <div
                                    className="ps-countdown-ring"
                                    role="timer"
                                    aria-label={`Redirecting to My Tokens in ${secondsLeft} seconds`}
                                >
                                    <svg
                                        className="ps-ring-svg"
                                        width="72" height="72"
                                        viewBox="0 0 64 64"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="32" cy="32" r="26"
                                            fill="none"
                                            stroke="#e4d5cc"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            cx="32" cy="32" r="26"
                                            fill="none"
                                            stroke="#0f6e56"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={CIRCUMFERENCE}
                                            strokeDashoffset={dashOffset}
                                            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                                        />
                                    </svg>
                                    <span className="ps-ring-number">
                                        {secondsLeft > 0 ? secondsLeft : '↗'}
                                    </span>
                                </div>
                                <p className="ps-countdown-label">
                                    Redirecting to My Tokens in {secondsLeft}s…
                                </p>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="ps-actions">
                            {!redirectCancelled ? (
                                <button
                                    className="bp-btn bp-btn--cancel"
                                    onClick={handleCancelRedirect}
                                >
                                    Cancel redirect
                                </button>
                            ) : (
                                <span className="ps-redirect-cancelled">Redirect cancelled</span>
                            )}

                            <button
                                className="bp-btn bp-btn--pay ps-btn-view"
                                style={{ background: '#0f6e56', borderColor: '#0f6e56' }}
                                onClick={() => navigate('/student/my-tokens')}
                            >
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M15 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"/>
                                    <polyline points="17 3 21 3 21 7"/>
                                    <line x1="11" y1="13" x2="21" y2="3"/>
                                </svg>
                                View My Tokens
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}