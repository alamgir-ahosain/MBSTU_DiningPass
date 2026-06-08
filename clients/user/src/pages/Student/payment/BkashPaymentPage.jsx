import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { bkashPaymentAPI, hallAdminAPI } from '../../../services/api';
import './BkashPaymentPage.css';

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';
const formatMealDateKey = (value) => (value ? new Date(value).toDateString() : '');

const MEAL_TYPE_OPTIONS = [
    { value: 'LUNCH',        label: 'Lunch only'     },
    { value: 'DINNER',       label: 'Dinner only'    },
    { value: 'LUNCH_DINNER', label: 'Lunch & Dinner' },
];

const MEAL_COLORS = {
    LUNCH:   { strip: '#c9952a', bg: '#fffbf2', border: '#e8c87a', text: '#7a4d00' },
    DINNER:  { strip: '#7b2236', bg: '#fdf5f7', border: '#e4a0ae', text: '#5c1929' },
    DEFAULT: { strip: '#8a6060', bg: '#f9f5f2', border: '#d4bfb0', text: '#4a3030' },
};
const getMealColor = (type) =>
    MEAL_COLORS[String(type || '').toUpperCase()] || MEAL_COLORS.DEFAULT;

const PAYMENT_METHODS = [
    {
        value: 'BKASH',
        label: 'bKash',
        note:  'Redirected to bKash — token issued automatically.',
        color: '#e91e8c',
        bg:    '#fdf0f8',
        border:'#f0a8d0',
    },
    // {
    //     value: 'NAGAD',
    //     label: 'Nagad',
    //     note:  'Redirected to Nagad — token issued automatically.',
    //     color: '#f47c20',
    //     bg:    '#fff5ed',
    //     border:'#f7c49a',
    // },
    // {
    //     value: 'CASH',
    //     label: 'Cash',
    //     note:  'Pay in person at the hall office before the deadline.',
    //     color: '#228b57',
    //     bg:    '#f0faf5',
    //     border:'#9fe1cb',
    // },
];

export const BkashPaymentPage = () => {
    const { userData } = useAuth();
    const [mealConfigs, setMealConfigs]       = useState([]);
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState('');
    const [selectedMealId, setSelectedMealId] = useState(null);
    const [showModal, setShowModal]           = useState(false);
    const [formData, setFormData]             = useState({ mealDate: '', mealTypes: 'LUNCH', paymentMethod: 'BKASH' });

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

    const fetchMealConfigs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await hallAdminAPI.getMealConfigs({ hallShortName: userData?.hallShortName });
            const all = Array.isArray(res.data) ? res.data : (res.data?.content || []);
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

    const openModal = (meal) => {
        setError('');
        setSelectedMealId(meal.id);
        setFormData({
            mealDate:      meal.mealDate,
            mealTypes:     meal.mealType === 'DINNER' ? 'DINNER' : 'LUNCH',
            paymentMethod: 'BKASH',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMealId(null);
        setError('');
        setFormData({ mealDate: '', mealTypes: 'LUNCH', paymentMethod: 'BKASH' });
    };

    const handlePay = async () => {
        if (!formData.mealDate)      { setError('Please select a meal date.');    return; }
        if (!formData.mealTypes)     { setError('Please select a meal type.');   return; }
        if (!formData.paymentMethod) { setError('Please select a payment method.'); return; }

        const mealTypesPayload = formData.mealTypes === 'LUNCH_DINNER'
            ? ['LUNCH', 'DINNER']
            : [formData.mealTypes];

        try {
            setLoading(true);
            setError('');
            const res = await bkashPaymentAPI.createPayment({
                paymentMethod: formData.paymentMethod,
                mealDate:      formData.mealDate,
                mealTypes:     mealTypesPayload,
            });
            const { paymentID, bkashURL } = res.data;
            if (!bkashURL) {
                setError('Payment gateway did not return a URL. Please try again.');
                return;
            }
            console.log('[Payment] redirecting, paymentID=', paymentID);
            window.location.assign(bkashURL);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error   ||
                err.message                 ||
                'Failed to start payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bp-wrapper">

            {/* ── Banner ── */}
            <div className="bp-banner">
                <div className="bp-banner-inner">
                    <div className="bp-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="bp-banner-title">Cut Token</h1>
                        <p className="bp-banner-sub">
                            Select a meal and complete bKash payment — your token is issued instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div className="bp-main">

                {error && !showModal && (
                    <div className="bp-alert bp-alert--error">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}

                {loading && !showModal ? (
                    <div className="bp-loading">
                        <div className="bp-spinner" />
                        <p>Loading available meals…</p>
                    </div>
                ) : !loading && mealConfigs.length === 0 ? (
                    <div className="bp-empty">
                        <div className="bp-empty-icon" aria-hidden="true">
                            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 9h18M3 15h18M3 21h18"/>
                            </svg>
                        </div>
                        <h3>No meals available right now</h3>
                        <p>Please check back later or contact your hall administration.</p>
                    </div>
                ) : (
                    <div className="bp-grid">
                        {mealConfigs.map((meal) => {
                            const color = getMealColor(meal.mealType);
                            const isSelected = selectedMealId === meal.id;
                            return (
                                <div
                                    key={meal.id}
                                    className={`bp-meal-card${isSelected ? ' bp-meal-card--selected' : ''}`}
                                    style={{
                                        '--mc-strip':  color.strip,
                                        '--mc-bg':     color.bg,
                                        '--mc-border': color.border,
                                    }}
                                >
                                    {/* Colour strip */}
                                    <div className="bp-mc-strip" />

                                    {/* Header */}
                                    <div className="bp-mc-head">
                                        <div className="bp-mc-type-wrap">
                                            <span className="bp-mc-dot" style={{ background: color.strip }} />
                                            <span className="bp-mc-type" style={{ color: color.text }}>
                                                {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                        <span className="bp-mc-date-badge">
                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            {formatDate(meal.mealDate)}
                                        </span>
                                    </div>

                                    {/* Detail rows */}
                                    <dl className="bp-mc-meta">
                                        {meal.mealMenu && (
                                            <div className="bp-mc-row">
                                                <dt>Menu</dt>
                                                <dd>{meal.mealMenu}</dd>
                                            </div>
                                        )}
                                        <div className="bp-mc-row bp-mc-row--price">
                                            <dt>Price</dt>
                                            <dd className="bp-mc-price">৳ {meal.mealPrice}</dd>
                                        </div>
                                        {meal.cutTokenBefore && (
                                            <div className="bp-mc-row">
                                                <dt>Booking closes</dt>
                                                <dd>{meal.cutTokenBefore}</dd>
                                            </div>
                                        )}
                                        {meal.tokenExpires && (
                                            <div className="bp-mc-row">
                                                <dt>Token valid until</dt>
                                                <dd>{meal.tokenExpires}</dd>
                                            </div>
                                        )}
                                        {meal.feastNote && (
                                            <div className="bp-mc-row bp-mc-row--note">
                                                <dt>Note</dt>
                                                <dd>{meal.feastNote}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    <button
                                        className="bp-btn bp-btn--select"
                                        onClick={() => openModal(meal)}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                                        </svg>
                                        Select &amp; Pay
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Payment Modal ── */}
            {showModal && (
                <div className="bp-overlay" role="dialog" aria-modal="true" aria-label="Confirm bKash Payment">
                    <div className="bp-modal">

                        {/* Modal header */}
                        <div className="bp-modal-head">
                            <div className="bp-modal-head-left">
                                <div className="bp-modal-bkash-badge">bKash</div>
                                <h2>Confirm Payment</h2>
                            </div>
                            <button
                                className="bp-modal-close"
                                onClick={closeModal}
                                disabled={loading}
                                aria-label="Close"
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <div className="bp-modal-body">

                            {/* Order summary */}
                            <div className="bp-summary">
                                <h3 className="bp-summary-title">Order Summary</h3>

                                <div className="bp-summary-row">
                                    <span>Date</span>
                                    <strong>{formatDate(formData.mealDate)}</strong>
                                </div>

                                {selectedMealDetails.map((meal) => (
                                    <div key={meal.id} className="bp-summary-meal">
                                        <div className="bp-summary-meal-head">
                                            <span
                                                className="bp-summary-meal-dot"
                                                style={{ background: getMealColor(meal.mealType).strip }}
                                            />
                                            <span className="bp-summary-meal-type">
                                                {meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                        <div className="bp-summary-row">
                                            <span>Menu</span>
                                            <strong>{meal.mealMenu}</strong>
                                        </div>
                                        <div className="bp-summary-row">
                                            <span>Price</span>
                                            <strong className="bp-price-accent">৳ {meal.mealPrice}</strong>
                                        </div>
                                    </div>
                                ))}

                                <div className="bp-summary-total">
                                    <span>Total</span>
                                    <strong>৳ {totalPrice}</strong>
                                </div>
                            </div>

                            {/* Meal type selector */}
                            <div className="bp-field-group">
                                <label className="bp-label" htmlFor="bp-mealTypes">Meal type</label>
                                <select
                                    id="bp-mealTypes"
                                    className="bp-select"
                                    value={formData.mealTypes}
                                    onChange={(e) => setFormData((p) => ({ ...p, mealTypes: e.target.value }))}
                                    disabled={loading}
                                >
                                    {MEAL_TYPE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment method */}
                            <div className="bp-field-group">
                                <label className="bp-label">Payment method</label>
                                <div className="bp-pm-grid">
                                    {PAYMENT_METHODS.map((pm) => {
                                        const active = formData.paymentMethod === pm.value;
                                        return (
                                            <button
                                                key={pm.value}
                                                type="button"
                                                className={`bp-pm-card${active ? ' bp-pm-card--active' : ''}`}
                                                style={active ? {
                                                    '--pm-color':  pm.color,
                                                    '--pm-bg':     pm.bg,
                                                    '--pm-border': pm.border,
                                                } : {}}
                                                onClick={() => setFormData((p) => ({ ...p, paymentMethod: pm.value }))}
                                                disabled={loading}
                                            >
                                                <span
                                                    className="bp-pm-badge"
                                                    style={{ background: pm.color }}
                                                >
                                                    {pm.label}
                                                </span>
                                                {active && (
                                                    <span className="bp-pm-check" style={{ color: pm.color }}>
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                    </span>
                                                )}
                                                <span className="bp-pm-note">{pm.note}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && (
                                <div className="bp-alert bp-alert--error">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="bp-modal-actions">
                                <button
                                    className="bp-btn bp-btn--pay"
                                    style={{
                                        background: PAYMENT_METHODS.find(p => p.value === formData.paymentMethod)?.color || '#e91e8c',
                                        borderColor: PAYMENT_METHODS.find(p => p.value === formData.paymentMethod)?.color || '#e91e8c',
                                    }}
                                    onClick={handlePay}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="bp-btn-spinner" /> Processing…</>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                                            </svg>
                                            Pay with {PAYMENT_METHODS.find(p => p.value === formData.paymentMethod)?.label || 'bKash'}
                                        </>
                                    )}
                                </button>
                                <button
                                    className="bp-btn bp-btn--cancel"
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