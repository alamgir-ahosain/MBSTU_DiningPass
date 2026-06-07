import { useSearchParams, Link } from 'react-router-dom';
import '../StudentPages.css';

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
export function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();

    const paymentID = searchParams.get('paymentID') || '—';
    const trxID     = searchParams.get('trxID')     || '—';
    const status    = searchParams.get('status')    || 'COMPLETED';

    return (
        <div className="page-wrapper">
            <div className="card">
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                    {/* Simple success icon using text — avoids any asset dependency */}
                    <div style={{ fontSize: '48px', lineHeight: 1 }}>✅</div>
                </div>

                <h1 className="page-title" style={{ textAlign: 'center' }}>Payment Successful</h1>
                <p className="page-subtitle" style={{ textAlign: 'center' }}>
                    Your bKash payment was confirmed. Your dining token has been issued automatically.
                </p>

                <div className="payment-summary" style={{ marginTop: '24px' }}>
                    <h3>Payment Details</h3>

                    <div className="summary-row">
                        <span>Status:</span>
                        <strong style={{ color: 'var(--color-success, #2e7d32)' }}>{status}</strong>
                    </div>
                    <div className="summary-row">
                        <span>bKash Payment ID:</span>
                        <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{paymentID}</strong>
                    </div>
                    <div className="summary-row">
                        <span>bKash Transaction ID:</span>
                        <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{trxID}</strong>
                    </div>
                </div>

                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Keep your Transaction ID <strong>{trxID}</strong> for your records.
                    It will also appear in your payment history.
                </p>

                <div className="form-actions" style={{ marginTop: '24px' }}>
                    <Link to="/student/my-tokens" className="btn btn-primary btn-submit">
                        View My Tokens
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
