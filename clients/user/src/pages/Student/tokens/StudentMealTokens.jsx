import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { mealTokenAPI, paymentAPI } from '../../../services/api';
import '../StudentPages.css';
import './StudentMealTokens.css';
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');
const formatMealTypes = (mealTypes) => {
    if (!Array.isArray(mealTypes) || mealTypes.length === 0) return '-';
    if (mealTypes.length === 1) return mealTypes[0];
    if (mealTypes.includes('LUNCH') && mealTypes.includes('DINNER')) return 'LUNCH & DINNER';
    return mealTypes.join(' & ');
};
const formatPaymentStatus = (status) => (status ? String(status).replaceAll('_', ' ') : 'PENDING');
const isRenderableScreenshotUrl = (url) => Boolean(url) && !String(url).startsWith('blob:');
const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (payload) return [payload];
    return [];
};
const downloadQRCode = (qrRef, mealType, mealDate) => {
    if (!qrRef) return;
    html2canvas(qrRef, { backgroundColor: '#ffffff', scale: 2 })
        .then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `QR_${mealType}_${mealDate}.png`;
            link.click();
        })
        .catch((err) => console.error('Failed to download QR code:', err));
};
export function StudentMealTokens() {
    const [payments, setPayments] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const qrRefsMap = useRef({});
    const visiblePayments = payments.filter((payment) => String(payment?.paymentStatus || '').toUpperCase() !== 'VERIFIED');
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        const [tokenResult, paymentResult] = await Promise.allSettled([
            mealTokenAPI.getMyTokens(),
            paymentAPI.getMyPayments(),
        ]);
        setTokens(tokenResult.status === 'fulfilled' ? normalizeList(tokenResult.value.data) : []);
        setPayments(paymentResult.status === 'fulfilled' ? normalizeList(paymentResult.value.data) : []);
        const partialErrors = [];
        if (tokenResult.status === 'rejected') partialErrors.push('approved tokens');
        if (paymentResult.status === 'rejected') partialErrors.push('my payments');
        if (partialErrors.length > 0) {
            setError(`Some data could not be loaded: ${partialErrors.join(' and ')}.`);
        }
        setLoading(false);
    }, []);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => { void loadData(); }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadData]);
    return (
        <div className="page-wrapper student-tokens-page">
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
            <div className="card">
                <h1 className="page-title">My Meal Tokens</h1>
                <p className="page-subtitle">
                    View your payment submissions and the approved QR meal tokens generated after verification.
                </p>
                {error && <div className="message error">{error}</div>}
                {loading ? (
                    <div className="empty-state"><p>Loading your meal payments and meal tokens...</p></div>
                ) : (
                    <>
                        <section className="student-section">
                            <div className="section-header-inline">
                                <h2 className="section-title">My Payments</h2>
                                <span className="section-count">{visiblePayments.length}</span>
                            </div>
                            {visiblePayments.length === 0 ? (
                                <div className="empty-state compact-empty-state">
                                    <h3>No pending or rejected payments</h3>
                                    <p>Verified payments are hidden from this section.</p>
                                </div>
                            ) : (
                                <div className="student-tokens-grid">
                                    {visiblePayments.map((payment) => {
                                        const mealTypesLabel = formatMealTypes(payment.mealTypes);
                                        const screenshotUrl = payment.screenshotUrl || payment.screenshot_url || '';
                                        const statusKey = String(payment.paymentStatus || 'PENDING').toLowerCase();
                                        return (
                                            <div key={payment.id} className={`student-token-card payment-record-card payment-${statusKey}`}>
                                                <div className="student-token-header">
                                                    <div>
                                                        <h3>{formatPaymentStatus(payment.paymentStatus)}</h3>
                                                        <p>{mealTypesLabel} • {formatDate(payment.mealDate)}</p>
                                                    </div>
                                                    <span className={`student-token-badge payment-badge-${statusKey}`}>
                                                        {formatPaymentStatus(payment.paymentStatus)}
                                                    </span>
                                                </div>
                                                <div className="student-token-meta">
                                                    {/*<p><strong>Hall:</strong> {payment.hallShortName || '-'}</p>*/}
                                                    <p><strong>Meal Types:</strong> {mealTypesLabel}</p>
                                                    <p><strong>Total Amount:</strong> {payment.totalAmount ?? '-'}</p>
                                                    <p><strong>Payment Method:</strong> {payment.paymentMethod || '-'}</p>
                                                    <p><strong>Sender Number:</strong> {payment.senderNumber || '-'}</p>
                                                    <p><strong>Submitted At:</strong> {formatDateTime(payment.submittedAt)}</p>
                                                    {payment.verifiedAt ? <p><strong>Verified At:</strong> {formatDateTime(payment.verifiedAt)}</p> : null}
                                                    {payment.verifiedByName ? <p><strong>Verified By:</strong> {payment.verifiedByName}</p> : null}
                                                    {payment.rejectionReason ? <p><strong>Rejection Reason:</strong> {payment.rejectionReason}</p> : null}
                                                </div>
                                                {screenshotUrl ? (
                                                    <div className="payment-rejection-proof">
                                                        <p className="payment-rejection-proof-title">Payment Proof</p>
                                                        {isRenderableScreenshotUrl(screenshotUrl) ? (
                                                            <img className="payment-rejection-proof-image" src={screenshotUrl} alt="Student payment proof" />
                                                        ) : (
                                                            <p className="payment-rejection-proof-note">The proof was stored as a temporary blob URL and cannot be shown here.</p>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                        <section className="student-section">
                            <div className="section-header-inline">
                                <h2 className="section-title">My Meal Tokens</h2>
                                <span className="section-count">{tokens.length}</span>
                            </div>
                            {tokens.length === 0 ? (
                                <div className="empty-state compact-empty-state">
                                    <h3>No approved tokens yet</h3>
                                    <p>Your approved meal tokens will appear here after hall staff verifies your payment.</p>
                                </div>
                            ) : (
                                <div className="student-tokens-grid">
                                    {tokens.map((token) => (
                                        <div key={token.id} className="student-token-card">
                                            <div className="student-token-header">
                                                <div>
                                                    <h3>{token.mealType || '-'}</h3>
                                                    <p>{formatDate(token.mealDate)}</p>
                                                </div>
                                                <span className="student-token-badge">{token.tokenStatus || 'APPROVED'}</span>
                                            </div>
                                            <div className="student-token-meta">
                                                <p><strong>Menu:</strong> {token.mealMenu || '-'}</p>
                                                <p><strong>Token Expiry:</strong> {token.tokenExpiry || '-'}</p>
                                            </div>
                                            {token.qrCodeData ? (
                                                <div className="student-token-code">
                                                    <div
                                                        className="qr-container"
                                                        ref={(el) => {
                                                            if (el) qrRefsMap.current[token.id] = el;
                                                        }}
                                                    >
                                                        <QRCodeCanvas value={token.qrCodeData} size={200} level="H" />
                                                    </div>
                                                    <button
                                                        className="btn-download-qr"
                                                        onClick={() => downloadQRCode(qrRefsMap.current[token.id], token.mealType, token.mealDate)}
                                                    >
                                                        Download QR Code
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
