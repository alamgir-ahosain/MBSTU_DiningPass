import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallStaffAPI } from '../../../services/api';
import '../HallStaffPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const getScreenshotUrl = (payment) => payment?.screenshotUrl || payment?.screenshot_url || '';
const isRenderableScreenshotUrl = (url) => Boolean(url) && !String(url).startsWith('blob:');

export const HallStaffPayments = () => {
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewPayment, setPreviewPayment] = useState(null);
    const [approvingId, setApprovingId] = useState('');
    const [rejectingId, setRejectingId] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const selectedScreenshot = useMemo(() => getScreenshotUrl(previewPayment), [previewPayment]);
    const selectedScreenshotIsRenderable = useMemo(() => isRenderableScreenshotUrl(selectedScreenshot), [selectedScreenshot]);

    const loadPayments = useCallback(async (targetPage = page) => {
        setLoading(true);
        setError('');
        try {
            const response = await hallStaffAPI.getPayments({ page: targetPage, size });
            const payload = response.data;
            setPayments(getItems(payload));
            setPage(typeof payload?.number === 'number' ? payload.number : targetPage);
            setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 1);
        } catch (err) {
            console.error('Failed to load payments', err);
            setError('Failed to load payments. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadPayments(0);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadPayments]);

    const openApprovalPreview = (payment) => {
        setPreviewPayment(payment);
        setRejectionReason('');
    };

    const closePreview = () => {
        setPreviewPayment(null);
        setRejectionReason('');
    };

    const handleApprove = async () => {
        if (!previewPayment?.id) return;

        setApprovingId(previewPayment.id);
        setError('');

        try {
            await hallStaffAPI.approvePayment(previewPayment.id);
            closePreview();
            await loadPayments(page);
        } catch (err) {
            console.error('Failed to approve payment', err);
            setError('Failed to approve payment. ' + (err.response?.data?.message || err.message));
        } finally {
            setApprovingId('');
        }
    };

    const handleReject = async () => {
        if (!previewPayment?.id) return;

        const reason = rejectionReason.trim();
        if (!reason) {
            setError('Please enter a rejection reason');
            return;
        }

        setRejectingId(previewPayment.id);
        setError('');

        try {
            await hallStaffAPI.rejectPayment(previewPayment.id, reason);
            closePreview();
            await loadPayments(page);
        } catch (err) {
            console.error('Failed to reject payment', err);
            setError('Failed to reject payment. ' + (err.response?.data?.message || err.message));
        } finally {
            setRejectingId('');
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Payments</h1>
                <p className="detail-subtitle">Review all submitted payments and approve them after checking the screenshot.</p>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state"><p>Loading payments...</p></div>
                ) : payments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No payments found</h3>
                        <p>Submitted student payments will appear here.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Date</th>
                                        <th>Meal Types</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Sender</th>
                                        <th>Status</th>
                                        <th>Screenshot</th>
                                        <th>Submitted At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => {
                                        const screenshotUrl = getScreenshotUrl(payment);
                                        return (
                                            <tr key={payment.id}>
                                                <td>{payment.studentId || '-'}</td>
                                                <td>{payment.mealDate || '-'}</td>
                                                <td>{Array.isArray(payment.mealTypes) ? payment.mealTypes.join(', ') : '-'}</td>
                                                <td>{payment.totalAmount ?? '-'}</td>
                                                <td>{payment.paymentMethod || '-'}</td>
                                                <td>{payment.senderNumber || '-'}</td>
                                                <td>{payment.paymentStatus || '-'}</td>
                                                <td>
                                                    {screenshotUrl ? (
                                                        <span className="text-muted">
                                                            {isRenderableScreenshotUrl(screenshotUrl) ? 'Available in approval card' : 'Temporary preview only'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">No image</span>
                                                    )}
                                                </td>
                                                <td>{payment.submittedAt || '-'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="btn-small btn-approve"
                                                            onClick={() => openApprovalPreview(payment)}
                                                            disabled={payment.paymentStatus && payment.paymentStatus !== 'SUBMITTED'}
                                                        >
                                                            Verify
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="button-group" style={{ justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => loadPayments(Math.max(0, page - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </button>
                            <span className="text-muted">Page {page + 1} of {Math.max(1, totalPages)}</span>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => loadPayments(page + 1)}
                                disabled={page + 1 >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {previewPayment && (
                <div className="payment-preview-overlay" onClick={closePreview} role="presentation">
                    <div className="payment-preview-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="payment-preview-title">
                        <div className="payment-preview-header">
                            <div>
                                <h2 id="payment-preview-title">Approve Payment</h2>
                                <p className="detail-subtitle">Review the screenshot before approving or rejecting this payment.</p>
                            </div>
                        </div>

                        <div className="payment-preview-details">
                            <p><strong>Student ID:</strong> {previewPayment.studentId || '-'}</p>
                            <p><strong>Meal Date:</strong> {previewPayment.mealDate || '-'}</p>
                            <p><strong>Meal Types:</strong> {Array.isArray(previewPayment.mealTypes) ? previewPayment.mealTypes.join(', ') : '-'}</p>
                            <p><strong>Amount:</strong> {previewPayment.totalAmount ?? '-'}</p>
                            <p><strong>Status:</strong> {previewPayment.paymentStatus || '-'}</p>
                        </div>

                        <div className="payment-preview-image-wrap">
                            {selectedScreenshotIsRenderable ? (
                                <div className="payment-preview-image-card">
                                    <p className="payment-preview-image-title">Payment Proof</p>
                                    <img
                                        className="payment-preview-image"
                                        src={selectedScreenshot}
                                        alt={`Payment screenshot for ${previewPayment.studentId || 'student'}`}
                                    />
                                </div>
                            ) : selectedScreenshot ? (
                                <div className="payment-preview-empty payment-preview-warning">
                                    <p>
                                        This payment proof is stored as a temporary `blob:` URL and cannot be displayed safely.
                                        Please ask the student to resubmit the payment proof using a real uploaded image URL.
                                    </p>
                                </div>
                            ) : (
                                <div className="payment-preview-empty">
                                    <p>No screenshot available for this payment.</p>
                                </div>
                            )}
                        </div>

                        <div className="payment-preview-form-group">
                            <label htmlFor="rejectionReason">Rejection Reason *</label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(event) => setRejectionReason(event.target.value)}
                                placeholder="Explain why this payment is being rejected"
                                rows="4"
                            />
                        </div>

                        <div className="button-group payment-preview-actions">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleApprove}
                                disabled={approvingId === previewPayment.id}
                            >
                                {approvingId === previewPayment.id ? 'Approving...' : 'Approve Payment'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={rejectingId === previewPayment.id}
                            >
                                {rejectingId === previewPayment.id ? 'Rejecting...' : 'Reject Payment'}
                            </button>
                            <button type="button" className="btn btn-cancel" onClick={closePreview}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

