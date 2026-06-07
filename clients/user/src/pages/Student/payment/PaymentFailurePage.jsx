import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { bkashPaymentAPI } from '../../../services/api';
import '../StudentPages.css';

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
export function PaymentFailurePage() {
    const [searchParams]  = useSearchParams();
    const [cancelling, setCancelling] = useState(false);
    const [cancelled,  setCancelled]  = useState(false);

    const rawMessage = searchParams.get('message') || 'Your payment could not be completed.';
    const paymentID  = searchParams.get('paymentID');

    // Human-readable message mapping for bKash status codes
    const friendlyMessage = (msg) => {
        const map = {
            cancel:             'You cancelled the payment.',
            failure:            'The payment failed on bKash.',
            missing_payment_id: 'Payment reference was missing. Please try again.',
            unknown_status:     'An unexpected error occurred. Please try again.',
        };
        return map[msg] || decodeURIComponent(msg);
    };

    // If the payment is still INITIATED (student closed bKash page without paying),
    // offer a manual cancel so they can start a fresh payment immediately.
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

    return (
        <div className="page-wrapper">
            <div className="card">
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                    <div style={{ fontSize: '48px', lineHeight: 1 }}>❌</div>
                </div>

                <h1 className="page-title" style={{ textAlign: 'center' }}>Payment Failed</h1>

                <div className="message error" style={{ marginTop: '16px' }}>
                    {friendlyMessage(rawMessage)}
                </div>

                {paymentID && (
                    <p className="page-subtitle" style={{ marginTop: '8px' }}>
                        Reference ID: <strong style={{ fontFamily: 'monospace' }}>{paymentID}</strong>
                    </p>
                )}

                <div className="empty-state" style={{ marginTop: '16px' }}>
                    <p>
                        If money was deducted from your bKash account but you see this page,
                        please check your <strong>Payment History</strong> — the token may have been
                        issued. If not, contact your hall administration with your Reference ID.
                    </p>
                </div>

                {/* Offer manual cancel only if paymentID is present and not yet cancelled */}
                {paymentID && !cancelled && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <button
                            className="btn btn-cancel"
                            onClick={handleManualCancel}
                            disabled={cancelling}
                            style={{ fontSize: '13px' }}
                        >
                            {cancelling ? 'Clearing pending payment…' : 'Clear pending payment & retry'}
                        </button>
                    </div>
                )}

                {cancelled && (
                    <div className="message success" style={{ marginTop: '12px' }}>
                        Pending payment cleared. You can start a new payment.
                    </div>
                )}

                <div className="form-actions" style={{ marginTop: '24px' }}>
                    <Link to="/student/cut-token" className="btn btn-primary btn-submit">
                        Try Again
                    </Link>
                    <Link to="/student/payment-history" className="btn btn-primary btn-submit">
                        Payment History
                    </Link>
                    <Link to="/student/dashboard" className="btn btn-cancel">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
