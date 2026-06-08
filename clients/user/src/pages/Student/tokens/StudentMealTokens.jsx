import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { mealTokenAPI, paymentAPI } from '../../../services/api';
import './StudentMealTokens.css';


const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const formatMealTypes = (mealTypes) => {
    if (!Array.isArray(mealTypes) || mealTypes.length === 0) return '—';
    if (mealTypes.includes('LUNCH') && mealTypes.includes('DINNER')) return 'Lunch & Dinner';
    return mealTypes.map(m => m.charAt(0) + m.slice(1).toLowerCase()).join(' & ');
};
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

const MEAL_COLORS = {
    BREAKFAST: { bg: '#fff8ed', border: '#f5c87a', text: '#7a4d00', dot: '#e8a020' },
    LUNCH:     { bg: '#fdf0f2', border: '#e4a0ae', text: '#7b2236', dot: '#7b2236' },
    DINNER:    { bg: '#f2f0fd', border: '#b0a8e8', text: '#3d2e8c', dot: '#5b50c9' },
    DEFAULT:   { bg: '#f5f1ee', border: '#d4bfb0', text: '#4a3030', dot: '#c9952a' },
};
const getMealColor = (type) => MEAL_COLORS[String(type || '').toUpperCase()] || MEAL_COLORS.DEFAULT;

export function StudentMealTokens() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const qrRefsMap = useRef({});

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        const [tokenResult] = await Promise.allSettled([
            mealTokenAPI.getMyTokens(),
        ]);
        setTokens(tokenResult.status === 'fulfilled' ? normalizeList(tokenResult.value.data) : []);
        if (tokenResult.status === 'rejected') setError('Could not load meal tokens. Please try again.');
        setLoading(false);
    }, []);

    useEffect(() => {
        const id = window.setTimeout(() => { void loadData(); }, 0);
        return () => window.clearTimeout(id);
    }, [loadData]);

    return (
        <div className="mt-wrapper">

            {/* Page Banner */}
            <div className="mt-banner">
                <div className="mt-banner-inner">
                    <div className="mt-banner-icon" aria-hidden="true">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="mt-banner-title">My Meal Tokens</h1>
                        <p className="mt-banner-sub">Approved meal tokens issued by hall administration</p>
                    </div>
                    {!loading && (
                        <div className="mt-banner-count">
                            <span className="mt-banner-count-num">{tokens.length}</span>
                            <span className="mt-banner-count-label">Token{tokens.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-main">

                {error && (
                    <div className="mt-alert mt-alert--error">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="mt-loading">
                        <div className="mt-spinner" />
                        <p>Loading your meal tokens…</p>
                    </div>
                ) : tokens.length === 0 ? (
                    <div className="mt-empty">
                        <div className="mt-empty-icon" aria-hidden="true">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                        </div>
                        <h3>No approved tokens yet</h3>
                        <p>Your meal tokens will appear here once hall staff verifies your payment.</p>
                    </div>
                ) : (
                    <div className="mt-grid">
                        {tokens.map((token) => {
                            const color = getMealColor(token.mealType);
                            return (
                                <div
                                    key={token.id}
                                    className="mt-card"
                                    style={{ '--card-border': color.border, '--card-bg': color.bg }}
                                >
                                    {/* Card Top Strip */}
                                    <div className="mt-card-strip" style={{ background: color.dot }} />

                                    {/* Card Header */}
                                    <div className="mt-card-head">
                                        <div className="mt-meal-type-wrap">
                                            <span className="mt-meal-dot" style={{ background: color.dot }} />
                                            <span className="mt-meal-type" style={{ color: color.text }}>
                                                {token.mealType
                                                    ? token.mealType.charAt(0) + token.mealType.slice(1).toLowerCase()
                                                    : '—'}
                                            </span>
                                        </div>
                                        <span className="mt-status-badge">
                                            <span className="mt-status-dot" />
                                            {token.tokenStatus || 'Approved'}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="mt-card-date">
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        {formatDate(token.mealDate)}
                                    </div>

                                    {/* Meta Fields */}
                                    <dl className="mt-meta">
                                        {token.mealMenu && (
                                            <div className="mt-meta-row">
                                                <dt>Menu</dt>
                                                <dd>{token.mealMenu}</dd>
                                            </div>
                                        )}
                                        {token.tokenExpiry && (
                                            <div className="mt-meta-row">
                                                <dt>Expires</dt>
                                                <dd>{token.tokenExpiry}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    {/* QR Code */}
                                    {token.qrCodeData && (
                                        <div className="mt-qr-section">
                                            <div className="mt-qr-label">
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h3v-3h-3v-3h-3v3z"/>
                                                </svg>
                                                Scan to verify
                                            </div>
                                            <div
                                                className="mt-qr-box"
                                                ref={(el) => { if (el) qrRefsMap.current[token.id] = el; }}
                                            >
                                                <QRCodeCanvas
                                                    value={token.qrCodeData}
                                                    size={180}
                                                    level="H"
                                                    bgColor="#ffffff"
                                                    fgColor="#2c0e17"
                                                />
                                            </div>
                                            <button
                                                className="mt-btn-download"
                                                onClick={() => downloadQRCode(qrRefsMap.current[token.id], token.mealType, token.mealDate)}
                                            >
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                                </svg>
                                                Download QR Code
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}