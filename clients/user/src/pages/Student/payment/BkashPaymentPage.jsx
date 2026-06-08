import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { bkashPaymentAPI, hallAdminAPI } from '../../../services/api';
import '../StudentPages.css';

const formatMealDateKey = (value) => (value ? new Date(value).toDateString() : '');

const mealTypeOptions = [
    { value: 'LUNCH',         label: 'Lunch only'       },
    { value: 'DINNER',        label: 'Dinner only'      },
    { value: 'LUNCH_DINNER',  label: 'Lunch & Dinner'   },
];

export const BkashPaymentPage = () => {
    const { userData } = useAuth();
    const [mealConfigs, setMealConfigs]       = useState([]);
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState('');
    const [selectedMealId, setSelectedMealId] = useState(null);
    const [showModal, setShowModal]           = useState(false);
    const [formData, setFormData]             = useState({
        mealDate:  '',
        mealTypes: 'LUNCH',
    });

    // ── Derive which meal configs match the current form selection ────────────
    const selectedMealDetails = useMemo(() => {
        if (!formData.mealDate) return [];
        const types = formData.mealTypes === 'LUNCH_DINNER'
            ? ['LUNCH', 'DINNER']
            : [formData.mealTypes];
        const dateKey = formatMealDateKey(formData.mealDate);
        return types
            .map((t) => mealConfigs.find(
                (m) => m.mealType === t && formatMealDateKey(m.mealDate) === dateKey
            ))
            .filter(Boolean);
    }, [formData.mealDate, formData.mealTypes, mealConfigs]);

    const totalPrice = useMemo(
        () => selectedMealDetails.reduce((s, m) => s + Number(m.mealPrice || 0), 0),
        [selectedMealDetails]
    );

    // ── Load active meal configs ──────────────────────────────────────────────
    const fetchMealConfigs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res  = await hallAdminAPI.getMealConfigs({ hallShortName: userData?.hallShortName });
            const all  = Array.isArray(res.data) ? res.data : (res.data?.content || []);
            setMealConfigs(all.filter((m) => m.isActive && m.isBookingOpen));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load meal configurations.');
        } finally {
            setLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        const id = setTimeout(() => { void fetchMealConfigs(); }, 0);
        return () => clearTimeout(id);
    }, [fetchMealConfigs]);

    // ── Open payment modal for a selected meal card ───────────────────────────
    const openModal = (meal) => {
        setError('');
        setSelectedMealId(meal.id);
        setFormData({
            mealDate:  meal.mealDate,
            mealTypes: meal.mealType === 'DINNER' ? 'DINNER' : 'LUNCH',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMealId(null);
        setError('');
        setFormData({ mealDate: '', mealTypes: 'LUNCH' });
    };

    // ── Submit: create payment, then redirect browser to bkashURL ────────────
    // bKash will call the BACKEND callback URL after the student pays.
    // The backend runs execute internally and redirects the browser to
    // /payment/success or /payment/failure — React does nothing else here.
    const handlePay = async () => {
        if (!formData.mealDate) { setError('Please select a meal date.'); return; }
        if (!formData.mealTypes) { setError('Please select a meal type.'); return; }

        const mealTypesPayload = formData.mealTypes === 'LUNCH_DINNER'
            ? ['LUNCH', 'DINNER']
            : [formData.mealTypes];

        try {
            setLoading(true);
            setError('');

            const res        = await bkashPaymentAPI.createPayment({
                paymentMethod: 'BKASH',
                mealDate:      formData.mealDate,
                mealTypes:     mealTypesPayload,
            });

            const { paymentID, bkashURL } = res.data;

            if (!bkashURL) {
                setError('bKash did not return a payment URL. Please try again.');
                return;
            }

            // Hand off to bKash. After the student pays, bKash calls:
            //   GET http://localhost:8082/api/payment/bkash/callback?paymentID=xxx&status=success
            // The backend executes the payment and redirects here to /payment/success or /payment/failure.
            console.log('[bKash] redirecting to bkashURL, paymentID=', paymentID);
            window.location.assign(bkashURL);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error   ||
                err.message                 ||
                'Failed to start bKash payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="page-wrapper">
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Pay with bKash</h1>
                <p className="page-subtitle">
                    Select a meal below and complete payment via bKash. Your token is issued instantly after payment.
                </p>

                {error && <div className="message error">{error}</div>}

                {loading && !showModal ? (
                    <div className="loading">Loading available meals…</div>
                ) : mealConfigs.length === 0 ? (
                    <div className="empty-state">
                        <p>No meals are available for booking right now.</p>
                        <p>Please check back later or contact your hall administration.</p>
                    </div>
                ) : (
                    <>
                        <div className="meal-configs-container">
                            {mealConfigs.map((meal) => (
                                <div
                                    key={meal.id}
                                    className={`meal-config-card ${selectedMealId === meal.id ? 'selected' : ''}`}
                                >
                                    <div className="meal-config-header">
                                        <h3>{meal.mealType}</h3>
                                        <span className="meal-date-badge">
                                            {new Date(meal.mealDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="meal-config-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Menu:</span>
                                            <span className="detail-value">{meal.mealMenu}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Price:</span>
                                            <span className="detail-value detail-price">৳ {meal.mealPrice}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Booking closes:</span>
                                            <span className="detail-value">{meal.cutTokenBefore}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Token valid until:</span>
                                            <span className="detail-value">{meal.tokenExpires}</span>
                                        </div>
                                        {meal.feastNote && (
                                            <div className="detail-row">
                                                <span className="detail-label">Note:</span>
                                                <span className="detail-value detail-note">{meal.feastNote}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '12px', width: '100%' }}
                                        onClick={() => openModal(meal)}
                                    >
                                        Select & Pay
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Payment Modal ─────────────────────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Confirm bKash Payment</h2>
                            <button className="modal-close" onClick={closeModal} disabled={loading}>✕</button>
                        </div>

                        <div className="modal-body">
                            {/* Order summary */}
                            <div className="payment-summary">
                                <h3>Order Summary</h3>
                                <div className="summary-row">
                                    <span>Date:</span>
                                    <strong>
                                        {formData.mealDate
                                            ? new Date(formData.mealDate).toLocaleDateString()
                                            : '—'}
                                    </strong>
                                </div>

                                {selectedMealDetails.map((meal) => (
                                    <div key={meal.id} className="selected-meal-card">
                                        <div className="summary-row">
                                            <span>Meal:</span>
                                            <strong>{meal.mealType}</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Menu:</span>
                                            <strong>{meal.mealMenu}</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Price:</span>
                                            <strong className="price">৳ {meal.mealPrice}</strong>
                                        </div>
                                    </div>
                                ))}

                                <div className="summary-row total-row">
                                    <span>Total:</span>
                                    <strong className="price">৳ {totalPrice}</strong>
                                </div>
                            </div>

                            {/* Meal type selector */}
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label htmlFor="mealTypes">Meal type</label>
                                <select
                                    id="mealTypes"
                                    value={formData.mealTypes}
                                    onChange={(e) => setFormData((p) => ({ ...p, mealTypes: e.target.value }))}
                                    disabled={loading}
                                >
                                    {mealTypeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment method (display only — always bKash on this page) */}
                            <div className="form-group">
                                <label>Payment method</label>
                                <input type="text" value="bKash" disabled />
                                <p className="form-hint">
                                    You will be redirected to the bKash payment page. After payment,
                                    your token is created automatically — no screenshot needed.
                                </p>
                            </div>

                            {error && <div className="message error">{error}</div>}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-submit"
                                    onClick={handlePay}
                                    disabled={loading}
                                >
                                    {loading ? 'Redirecting to bKash…' : 'Pay with bKash'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-cancel"
                                    onClick={closeModal}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
