
/**
 * The backend callback controller redirects here when:
 *   - bKash returns status=cancel or status=failure
 *   - executePayment() throws an exception
 *   - payment is not completed after execute
 *
 * URL: /payment/failure?message=cancel&paymentID=xxx   (paymentID may be absent)
 *
 * This page is PUBLIC — no ProtectedRoute needed.
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { bkashPaymentAPI } from '../../../services/api';
import './BkashPaymentPage.css';
import './PaymentFailurePage.css';

/**
 * The backend callback controller redirects here when:
 *   - bKash returns status=cancel or status=failure
 *   - executePayment() throws an exception
 *   - payment is not completed after execute
 *
 * URL: /payment/failure?message=cancel&paymentID=xxx   (paymentID may be absent)
 *
 * This page is PUBLIC — no ProtectedRoute needed.
 */

const REDIRECT_SECONDS = 5;
const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

export function PaymentFailurePage() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();

    const [cancelling,       setCancelling]       = useState(false);
    const [cancelled,        setCancelled]         = useState(false);
    const [redirectCancelled, setRedirectCancelled] = useState(false);
    const [secondsLeft,      setSecondsLeft]       = useState(REDIRECT_SECONDS);

    const timerRef = useRef(null);

    const rawMessage = searchParams.get('message') || 'Your payment could not be completed.';
    const paymentID  = searchParams.get('paymentID');

    const friendlyMessage = (msg) => {
        const map = {
            cancel:             'You cancelled the payment.',
            failure:            'The payment failed on bKash.',
            missing_payment_id: 'Payment reference was missing. Please try again.',
            unknown_status:     'An unexpected error occurred. Please try again.',
        };
        return map[msg] || decodeURIComponent(msg);
    };

    /* ── Countdown auto-redirect ─────────────────────────────────── */
    useEffect(() => {
        if (redirectCancelled) return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    navigate('/student/cut-token');
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

    /* ── Manual bKash payment cancel ─────────────────────────────── */
    const handleManualCancel = async () => {
        if (!paymentID) return;
        try {
            setCancelling(true);
            await bkashPaymentAPI.cancelPayment({ paymentID });
            setCancelled(true);
        } catch {
            // Backend may have already marked it FAILED via the callback — ignore
            setCancelled(true);
        } finally {
            setCancelling(false);
        }
    };

    /* ── Ring progress ───────────────────────────────────────────── */
    const progress     = secondsLeft / REDIRECT_SECONDS;           // 1 → 0
    const dashOffset   = CIRCUMFERENCE * (1 - progress);           // 0 → full

    return (
        <div className="pf-wrapper">

            {/* ── Banner ── */}
            <div className="pf-banner">
                <div className="pf-banner-inner">
                    <div className="pf-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9"  y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="pf-banner-title">Payment Failed</h1>
                        <p className="pf-banner-sub">
                            Your transaction could not be completed.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="pf-main">
                <div className="pf-card">

                    {/* Colour strip */}
                    <div className="pf-card-strip" />

                    <div className="pf-card-body">

                        {/* Icon */}
                        <div className="pf-icon-circle" aria-hidden="true">
                            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth="1.6">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9"  y2="15"/>
                                <line x1="9"  y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>

                        <h2 className="pf-title">Payment Failed</h2>

                        {/* Error message */}
                        <div className="pf-msg pf-msg--error">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8"  x2="12"   y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {friendlyMessage(rawMessage)}
                        </div>

                        {/* Reference ID */}
                        {paymentID && (
                            <p className="pf-ref">
                                Reference ID:{' '}
                                <strong className="pf-ref-id">{paymentID}</strong>
                            </p>
                        )}

                        {/* Info box */}
                        <div className="pf-info-box">
                            <p>
                                If money was deducted from your bKash account but you see this page,
                                please check your <strong>Payment History</strong> — the token may
                                have been issued. If not, contact your hall administration with your
                                Reference ID.
                            </p>
                        </div>

                        {/* Manual cancel button */}
                        {paymentID && !cancelled && (
                            <div className="pf-manual-cancel">
                                <button
                                    className="bp-btn bp-btn--cancel pf-btn-sm"
                                    onClick={handleManualCancel}
                                    disabled={cancelling}
                                >
                                    {cancelling
                                        ? 'Clearing pending payment…'
                                        : 'Clear pending payment & retry'}
                                </button>
                            </div>
                        )}

                        {cancelled && (
                            <div className="pf-msg pf-msg--success">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                                Pending payment cleared. You can start a new payment.
                            </div>
                        )}

                        {/* ── Countdown ring ── */}
                        {!redirectCancelled && (
                            <div className="pf-countdown">
                                <div className="pf-countdown-ring" role="timer"
                                     aria-label={`Redirecting in ${secondsLeft} seconds`}>
                                    <svg
                                        className="pf-ring-svg"
                                        width="72" height="72"
                                        viewBox="0 0 64 64"
                                        aria-hidden="true"
                                    >
                                        {/* Track */}
                                        <circle
                                            cx="32" cy="32" r="26"
                                            fill="none"
                                            stroke="#e4d5cc"
                                            strokeWidth="4"
                                        />
                                        {/* Progress arc */}
                                        <circle
                                            cx="32" cy="32" r="26"
                                            fill="none"
                                            stroke="#c9952a"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={CIRCUMFERENCE}
                                            strokeDashoffset={dashOffset}
                                            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                                        />
                                    </svg>
                                    <span className="pf-ring-number">
                                        {secondsLeft > 0 ? secondsLeft : '↗'}
                                    </span>
                                </div>
                                <p className="pf-countdown-label">
                                    Redirecting to Try Again in {secondsLeft}s…
                                </p>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="pf-actions">
                            {!redirectCancelled ? (
                                <button
                                    className="bp-btn bp-btn--cancel"
                                    onClick={handleCancelRedirect}
                                >
                                    Cancel redirect
                                </button>
                            ) : (
                                <span className="pf-redirect-cancelled">Redirect cancelled</span>
                            )}

                            <button
                                className="bp-btn bp-btn--pay pf-btn-try"
                                style={{ background: '#7b2236', borderColor: '#7b2236' }}
                                onClick={() => navigate('/student/cut-token')}
                            >
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                                    <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                Try Again Now
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}