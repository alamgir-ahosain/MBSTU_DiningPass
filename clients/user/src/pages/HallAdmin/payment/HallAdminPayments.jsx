import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallAdminAPI } from '../../../services/api';
import '../HallAdminPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export const HallAdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPayments = async (targetPage = page) => {
        setLoading(true);
        setError('');
        try {
            const response = await hallAdminAPI.getPayments({ page: targetPage, size });
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
    };

    useEffect(() => {
        loadPayments(0);
    }, []);

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Payments</h1>
                <p className="detail-subtitle">Get all payment submissions for your hall.</p>

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
                                        <th>Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{payment.studentId || '-'}</td>
                                            <td>{payment.mealDate || '-'}</td>
                                            <td>{Array.isArray(payment.mealTypes) ? payment.mealTypes.join(', ') : '-'}</td>
                                            <td>{payment.totalAmount ?? '-'}</td>
                                            <td>{payment.paymentMethod || '-'}</td>
                                            <td>{payment.senderNumber || '-'}</td>
                                            <td>{payment.paymentStatus || '-'}</td>
                                            <td>{payment.submittedAt || '-'}</td>
                                        </tr>
                                    ))}
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
        </div>
    );
};

