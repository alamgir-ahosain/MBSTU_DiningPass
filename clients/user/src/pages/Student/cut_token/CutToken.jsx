import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { hallAdminAPI, mealTokenAPI } from '../../../services/api';
import '../StudentPages.css';
import './CutToken.css';

const formatMealDateKey = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toDateString();
};

export const CutToken = () => {
    const { userData } = useAuth();
    const [mealConfigs, setMealConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMealId, setSelectedMealId] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [formData, setFormData] = useState({
        paymentMethod: 'BKASH',
        senderNumber: '',
        mealDate: '',
        mealTypes: 'LUNCH',
        screenshotUrl: ''
    });

    const mealTypeOptions = [
        { value: 'LUNCH', label: 'LUNCH' },
        { value: 'DINNER', label: 'DINNER' },
        { value: 'LUNCH_DINNER', label: 'LUNCH & DINNER' }
    ];

    const selectedMealDetails = useMemo(() => {
        if (!formData.mealDate) return [];

        const selectedTypes =
            formData.mealTypes === 'LUNCH_DINNER'
                ? ['LUNCH', 'DINNER']
                : [formData.mealTypes];

        const selectedDateKey = formatMealDateKey(formData.mealDate);

        return selectedTypes
            .map((mealType) => mealConfigs.find((meal) => (
                meal.mealType === mealType && formatMealDateKey(meal.mealDate) === selectedDateKey
            )))
            .filter(Boolean);
    }, [mealConfigs, formData.mealDate, formData.mealTypes]);

    const selectedMealTotal = useMemo(() => (
        selectedMealDetails.reduce((sum, meal) => sum + Number(meal.mealPrice || 0), 0)
    ), [selectedMealDetails]);

    const fetchMealConfigs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching meals for hall:', userData?.hallShortName);
            const response = await hallAdminAPI.getMealConfigs({
                hallShortName: userData?.hallShortName
            });
            console.log('Meals response:', response.data);
            let meals = Array.isArray(response.data) ? response.data : response.data?.content || [];
            const activeMeals = meals.filter(meal => meal.isActive && meal.isBookingOpen);
            console.log('Active meals:', activeMeals);
            setMealConfigs(activeMeals);
        } catch (err) {
            console.error('Error fetching meal configs:', err);
            setError(err.response?.data?.message || 'Failed to load meal configurations');
        } finally {
            setLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchMealConfigs();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchMealConfigs]);

    const openPaymentForm = (meal) => {
        if (!meal) {
            setError('Meal not found');
            return;
        }
        setError('');
        setSelectedMealId(meal.id);
        setFormData({
            paymentMethod: 'BKASH',
            senderNumber: '',
            mealDate: meal.mealDate,
            mealTypes: meal.mealType === 'DINNER' ? 'DINNER' : 'LUNCH',
            screenshotUrl: ''
        });
        setShowPaymentForm(true);
    };

    const handleCutTokenClick = () => {
        const selectedMeal = mealConfigs.find((meal) => meal.id === selectedMealId) || mealConfigs[0];

        if (!selectedMeal) {
            setError('No meal is available for booking');
            return;
        }

        setSelectedMealId(selectedMeal.id);
        openPaymentForm(selectedMeal);
    };

    const handleMealTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            mealTypes: e.target.value
        }));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({
                    ...prev,
                    screenshotUrl: typeof reader.result === 'string' ? reader.result : ''
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitPayment = async () => {
        try {
            setLoading(true);
            setError('');
            if (!formData.senderNumber) {
                setError('Please enter your payment mobile number');
                setLoading(false);
                return;
            }
            if (!formData.mealTypes) {
                setError('Please select a meal type');
                setLoading(false);
                return;
            }
            if (!formData.screenshotUrl) {
                setError('Please select payment proof');
                setLoading(false);
                return;
            }
            const meal = mealConfigs.find(m => m.id === selectedMealId);
            if (!meal) {
                setError('Meal not found');
                setLoading(false);
                return;
            }
            const mealTypesPayload =
                formData.mealTypes === 'LUNCH_DINNER'
                    ? ['LUNCH', 'DINNER']
                    : [formData.mealTypes];
            const paymentPayload = {
                paymentMethod: formData.paymentMethod,
                senderNumber: formData.senderNumber,
                mealDate: formData.mealDate,
                mealTypes: mealTypesPayload,
                screenshotUrl: formData.screenshotUrl || null
            };
            await mealTokenAPI.cutToken(paymentPayload);
            alert('Payment submitted successfully! Please wait for verification.');
            setShowPaymentForm(false);
            setSelectedMealId(null);
            fetchMealConfigs();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Failed to submit payment'
            );
            console.error('Error submitting payment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowPaymentForm(false);
        setSelectedMealId(null);
        setError('');
        setFormData({
            paymentMethod: 'BKASH',
            senderNumber: '',
            mealDate: '',
            mealTypes: 'LUNCH',
            screenshotUrl: ''
        });
    };

    return (
        <div className="page-wrapper">
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
            <div className="card">
                <h1 className="page-title">Cut Meal Token</h1>
                <p className="page-subtitle">Select a meal and book your dining pass</p>
                {error && <div className="message error">{error}</div>}
                {loading && !showPaymentForm ? (
                    <div className="loading">Loading meal configurations...</div>
                ) : mealConfigs.length === 0 ? (
                    <div className="empty-state">
                        <p>No meals available for booking at this time.</p>
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
                                        <span className={`meal-date-badge ${new Date(meal.mealDate) < new Date() ? 'past' : ''}`}>
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
                                            <span className="detail-label">Booking Deadline:</span>
                                            <span className="detail-value">{meal.cutTokenBefore}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Token Valid Until:</span>
                                            <span className="detail-value">{meal.tokenExpires}</span>
                                        </div>
                                        {meal.feastNote && (
                                            <div className="detail-row">
                                                <span className="detail-label">Special Note:</span>
                                                <span className="detail-value detail-note">{meal.feastNote}</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedMealId === meal.id && (
                                        <div className="meal-selected-indicator">✓ Selected</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="button-group cut-token-action-group">
                            <button
                                className="btn btn-primary btn-cut-token"
                                onClick={handleCutTokenClick}
                                disabled={loading}
                            >
                                Cut Token
                            </button>
                        </div>
                    </>
                )}
            </div>
            {showPaymentForm && selectedMealId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Meal Token Payment</h2>
                            <button
                                className="modal-close"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-summary">
                                <h3>Meal Details</h3>
                                <div className="summary-row">
                                    <span>Date:</span>
                                    <strong>{formData.mealDate ? new Date(formData.mealDate).toLocaleDateString() : '-'}</strong>
                                </div>
                                <div className="selected-meal-details">
                                    {selectedMealDetails.length > 0 ? selectedMealDetails.map((meal) => (
                                        <div key={meal.id} className="selected-meal-card">
                                            <div className="summary-row">
                                                <span>Meal Type:</span>
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
                                    )) : (
                                        <div className="summary-row">
                                            <span>Meal Type:</span>
                                            <strong>{formData.mealTypes === 'LUNCH_DINNER' ? 'LUNCH & DINNER' : formData.mealTypes}</strong>
                                        </div>
                                    )}
                                </div>
                                <div className="summary-row total-row">
                                    <span>Total Price:</span>
                                    <strong className="price">৳ {selectedMealTotal}</strong>
                                </div>
                            </div>
                            <form className="payment-form">
                                <div className="form-group">
                                    <label htmlFor="mealDate">Meal Date</label>
                                    <input
                                        type="text"
                                        id="mealDate"
                                        value={formData.mealDate ? new Date(formData.mealDate).toLocaleDateString() : ''}
                                        disabled
                                    />
                                    <p className="form-hint">Auto-filled from the selected meal configuration.</p>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mealTypes">Select Meal Type *</label>
                                    <select
                                        id="mealTypes"
                                        name="mealTypes"
                                        value={formData.mealTypes}
                                        onChange={handleMealTypeChange}
                                        disabled={loading}
                                    >
                                        {mealTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paymentMethod">Payment Method *</label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleFormChange}
                                        disabled={loading}
                                    >
                                        <option value="BKASH">bKash</option>
                                        <option value="NAGAD">Nagad</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="senderNumber">Sender Mobile Number *</label>
                                    <input
                                        type="tel"
                                        id="senderNumber"
                                        name="senderNumber"
                                        value={formData.senderNumber}
                                        onChange={handleFormChange}
                                        placeholder="01XXXXXXXXX"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="screenshotUrl">Payment Proof *</label>
                                    <input
                                        type="file"
                                        id="screenshotUrl"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        disabled={loading}
                                        required
                                    />
                                    {formData.screenshotUrl && (
                                        <p className="file-info">Screenshot selected ✓</p>
                                    )}
                                </div>
                                {error && <div className="message error">{error}</div>}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-submit"
                                        onClick={handleSubmitPayment}
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Payment'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


