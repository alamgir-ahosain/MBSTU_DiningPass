import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../../../services/api';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');
const formatMealTypes = (mealTypes) => {
    if (!Array.isArray(mealTypes) || mealTypes.length === 0) return '-';
    if (mealTypes.length === 1) return mealTypes[0];
    if (mealTypes.includes('LUNCH') && mealTypes.includes('DINNER')) return 'LUNCH & DINNER';
    return mealTypes.join(' & ');
};

export const PaymentHistroryPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await paymentAPI.getMyPayments();
            const payload = Array.isArray(response.data)
                ? response.data
                : response.data?.content || [];
            setPayments(payload);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payment history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadPayments();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadPayments]);

    const sortedPayments = useMemo(() => ([...payments].sort((left, right) => {
        const leftValue = new Date(left.submittedAt || left.createdAt || 0).getTime();
        const rightValue = new Date(right.submittedAt || right.createdAt || 0).getTime();
        return rightValue - leftValue;
    })), [payments]);

    return (
        <div className="page-wrapper student-tokens-page">
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
            <div className="card">
                <h1 className="page-title">Payment History</h1>
                <p className="page-subtitle">Track your bKash payment requests, statuses, and verification results.</p>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state"><p>Loading payment history...</p></div>
                ) : sortedPayments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No payments found</h3>
                        <p>Start a new bKash payment to see it listed here.</p>
                        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                            <Link to="/student/cut-token" className="btn btn-primary btn-submit">
                                Pay with bKash
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="student-tokens-grid">
                        {sortedPayments.map((payment) => {
                            const statusKey = String(payment.paymentStatus || 'PENDING').toLowerCase();
                            return (
                                <div key={payment.id} className={`student-token-card payment-record-card payment-${statusKey}`}>
                                    <div className="student-token-header">
                                        <div>
                                            <h3>{String(payment.paymentStatus || 'PENDING').replaceAll('_', ' ')}</h3>
                                            <p>{formatMealTypes(payment.mealTypes)} • {formatDate(payment.mealDate)}</p>
                                        </div>
                                        <span className={`student-token-badge payment-badge-${statusKey}`}>
                                            {String(payment.paymentStatus || 'PENDING').replaceAll('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="student-token-meta">
                                        <p><strong>Meal Types:</strong> {formatMealTypes(payment.mealTypes)}</p>
                                        <p><strong>Total Amount:</strong> ৳ {payment.totalAmount ?? '-'}</p>
                                        <p><strong>Payment Method:</strong> {payment.paymentMethod || '-'}</p>
                                        <p><strong>Submitted At:</strong> {formatDateTime(payment.submittedAt)}</p>
                                        {payment.verifiedAt ? <p><strong>Verified At:</strong> {formatDateTime(payment.verifiedAt)}</p> : null}
                                        {payment.verifiedByName ? <p><strong>Verified By:</strong> {payment.verifiedByName}</p> : null}
                                        {payment.rejectionReason ? <p><strong>Message:</strong> {payment.rejectionReason}</p> : null}
                                        {payment.bkashPaymentId ? <p><strong>bKash Payment ID:</strong> {payment.bkashPaymentId}</p> : null}
                                        {payment.bkashTrxId ? <p><strong>bKash Transaction ID:</strong> {payment.bkashTrxId}</p> : null}
                                        {payment.merchantInvoiceNo ? <p><strong>Invoice No:</strong> {payment.merchantInvoiceNo}</p> : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

