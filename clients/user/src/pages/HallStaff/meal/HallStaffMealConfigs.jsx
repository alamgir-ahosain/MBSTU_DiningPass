import { useEffect, useMemo, useState, useCallback } from 'react';
import { hallStaffAPI } from '../../../services/api';
import './HallStaffMealConfigs.css';

/* ── helpers ─────────────────────────────────────────────── */
const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const getTokenExpireTime = (mealType) =>
    mealType === 'DINNER' ? '22:00' : '15:00';

const formatDate = (v) =>
    v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (v) =>
    v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const createDefaultForm = () => ({
    mealDate:       '',
    mealType:       'LUNCH',
    mealMenu:       '',
    mealPrice:      30,
    cutTokenBefore: '00:00',
    tokenExpires:   getTokenExpireTime('LUNCH'),
    feastNote:      '',
});

const MEAL_COLORS = {
    LUNCH:  { strip: '#c9952a', text: '#7a4d00', bg: '#fffbf2', border: '#e8c87a' },
    DINNER: { strip: '#7b2236', text: '#5c1929', bg: '#fdf5f7', border: '#e4a0ae' },
};
const getMC = (type) => MEAL_COLORS[String(type || '').toUpperCase()] || MEAL_COLORS.LUNCH;

/* ── component ───────────────────────────────────────────── */
export const HallStaffMealConfigs = () => {
    const [configs,     setConfigs]     = useState([]);
    const [createForm,  setCreateForm]  = useState(createDefaultForm());
    const [editingId,   setEditingId]   = useState('');
    const [updateForm,  setUpdateForm]  = useState({
        mealMenu: '', mealPrice: '', cutTokenBefore: '',
        tokenExpires: '', isActive: true, feastNote: '',
    });
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState('');
    const [success,     setSuccess]     = useState('');
    const [expandedId,  setExpandedId]  = useState('');

    const editableConfig = useMemo(
        () => configs.find((c) => c.id === editingId),
        [configs, editingId],
    );

    /* ── data ── */
    const loadConfigs = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await hallStaffAPI.getMealConfigs();
            setConfigs(getItems(res.data));
        } catch (err) {
            setError('Failed to load meal configurations. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadConfigs(); }, []);

    /* close modal on Escape */
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setEditingId(''); };
        if (editingId) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [editingId]);

    /* lock body scroll when modal open */
    useEffect(() => {
        document.body.style.overflow = editingId ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [editingId]);

    /* ── handlers ── */
    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        const next = { ...createForm, [name]: value };
        if (name === 'mealType') next.tokenExpires = getTokenExpireTime(value);
        setCreateForm(next);
    };

    const handleUpdateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUpdateForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true); setError(''); setSuccess('');
        try {
            await hallStaffAPI.createMealConfig({ ...createForm, mealPrice: Number(createForm.mealPrice) });
            setSuccess('Meal configuration created successfully.');
            setCreateForm(createDefaultForm());
            await loadConfigs();
        } catch (err) {
            setError('Failed to create meal configuration. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const prepareEdit = useCallback((config) => {
        setEditingId(config.id);
        setUpdateForm({
            mealMenu:       config.mealMenu       || '',
            mealPrice:      config.mealPrice       ?? '',
            cutTokenBefore: config.cutTokenBefore  || '',
            tokenExpires:   config.tokenExpires    || '',
            isActive:       typeof config.isActive === 'boolean' ? config.isActive : true,
            feastNote:      config.feastNote       || '',
        });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingId) return;
        setSaving(true); setError(''); setSuccess('');
        try {
            await hallStaffAPI.updateMealConfig(editingId, { ...updateForm, mealPrice: Number(updateForm.mealPrice) });
            setSuccess('Meal configuration updated successfully.');
            setEditingId('');
            await loadConfigs();
        } catch (err) {
            setError('Failed to update meal configuration. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => setEditingId('');

    /* ── render ── */
    return (
        <div className="mc-wrapper">

            {/* ── Banner ── */}
            <div className="mc-banner">
                <div className="mc-banner-inner">
                    <div className="mc-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="mc-banner-title">Meal Configurations</h1>
                        <p className="mc-banner-sub">Create and manage meal schedules for your hall</p>
                    </div>
                    {!loading && (
                        <div className="mc-banner-stat">
                            <span className="mc-banner-stat-num">{configs.length}</span>
                            <span className="mc-banner-stat-label">Config{configs.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mc-main">

                {/* ── Global alerts ── */}
                {error && (
                    <div className="mc-alert mc-alert--error">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mc-alert mc-alert--success">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {success}
                    </div>
                )}

                {/* ── SECTION 1: Configs list ── */}
                <section className="mc-section">
                    <div className="mc-section-head">
                        <h2>All Meal Configs</h2>
                        {!loading && <span className="mc-count">{configs.length}</span>}
                    </div>

                    {loading ? (
                        <div className="mc-loading">
                            <div className="mc-spinner" />
                            <p>Loading meal configurations…</p>
                        </div>
                    ) : configs.length === 0 ? (
                        <div className="mc-empty">
                            <div className="mc-empty-icon">
                                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                                </svg>
                            </div>
                            <h3>No configurations yet</h3>
                            <p>Use the form below to create the first meal config.</p>
                        </div>
                    ) : (
                        <div className="mc-grid">
                            {configs.map((cfg) => {
                                const mc = getMC(cfg.mealType);
                                const isExpanded    = expandedId  === cfg.id;
                                const isBeingEdited = editingId   === cfg.id;
                                return (
                                    <div
                                        key={cfg.id}
                                        className={`mc-card${isBeingEdited ? ' mc-card--editing' : ''}`}
                                        style={{ '--mc-strip': mc.strip, '--mc-bg': mc.bg, '--mc-border': mc.border }}
                                    >
                                        <div className="mc-card-strip" />

                                        {/* card head */}
                                        <div className="mc-card-head">
                                            <div className="mc-card-type-wrap">
                                                <span className="mc-card-dot" style={{ background: mc.strip }} />
                                                <span className="mc-card-type" style={{ color: mc.text }}>
                                                    {cfg.mealType.charAt(0) + cfg.mealType.slice(1).toLowerCase()}
                                                </span>
                                            </div>
                                            <div className="mc-card-badges">
                                                <span className={`mc-badge ${cfg.isActive ? 'mc-badge--active' : 'mc-badge--inactive'}`}>
                                                    {cfg.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {cfg.isBookingOpen && (
                                                    <span className="mc-badge mc-badge--open">Booking Open</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* date */}
                                        <div className="mc-card-date">
                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            {formatDate(cfg.mealDate)}
                                        </div>

                                        {/* summary */}
                                        <dl className="mc-card-summary">
                                            <div className="mc-card-row">
                                                <dt>Menu</dt>
                                                <dd>{cfg.mealMenu || '—'}</dd>
                                            </div>
                                            <div className="mc-card-row mc-card-row--price">
                                                <dt>Price</dt>
                                                <dd>৳ {cfg.mealPrice ?? '—'}</dd>
                                            </div>
                                            <div className="mc-card-row">
                                                <dt>Cut before</dt>
                                                <dd>{cfg.cutTokenBefore || '—'}</dd>
                                            </div>
                                            <div className="mc-card-row">
                                                <dt>Expires</dt>
                                                <dd>{cfg.tokenExpires || '—'}</dd>
                                            </div>
                                        </dl>

                                        {/* expand toggle */}
                                        <button
                                            className="mc-card-toggle"
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? '' : cfg.id)}
                                        >
                                            {isExpanded ? 'Show less ▲' : 'Show more ▼'}
                                        </button>

                                        {/* expanded details */}
                                        {isExpanded && (
                                            <dl className="mc-card-details">
                                                <div className="mc-card-row">
                                                    <dt>Hall</dt><dd>{cfg.hallShortName || '—'}</dd>
                                                </div>
                                                {cfg.feastNote && (
                                                    <div className="mc-card-row">
                                                        <dt>Note</dt><dd className="mc-note">{cfg.feastNote}</dd>
                                                    </div>
                                                )}
                                                <div className="mc-card-row">
                                                    <dt>Tokens sold</dt><dd>{cfg.totalTokensSold ?? '—'}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Tokens used</dt><dd>{cfg.totalTokensUsed ?? '—'}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Tokens unused</dt><dd>{cfg.totalTokenPending ?? '—'}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Created by</dt><dd>{cfg.createdByName || '—'}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Updated by</dt><dd>{cfg.updatedByName || '—'}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Created at</dt><dd>{formatDateTime(cfg.createdAt)}</dd>
                                                </div>
                                                <div className="mc-card-row">
                                                    <dt>Updated at</dt><dd>{formatDateTime(cfg.updatedAt)}</dd>
                                                </div>
                                            </dl>
                                        )}

                                        {/* actions */}
                                        <div className="mc-card-actions">
                                            <button
                                                type="button"
                                                className={`mc-btn mc-btn--edit${isBeingEdited ? ' mc-btn--editing' : ''}`}
                                                onClick={() => isBeingEdited ? closeModal() : prepareEdit(cfg)}
                                            >
                                                {isBeingEdited ? (
                                                    <>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                        Cancel Edit
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                        Edit
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── SECTION 2: Create form ── */}
                <section className="mc-section">
                    <div className="mc-section-head">
                        <h2>Create Meal Config</h2>
                    </div>
                    <div className="mc-form-card">
                        <form onSubmit={handleCreate}>
                            <div className="mc-form-grid">
                                <div className="mc-field">
                                    <label htmlFor="mc-mealDate">Meal Date</label>
                                    <input id="mc-mealDate" type="date" name="mealDate"
                                           value={createForm.mealDate} onChange={handleCreateChange} required disabled={saving} />
                                </div>
                                <div className="mc-field">
                                    <label htmlFor="mc-mealType">Meal Type</label>
                                    <select id="mc-mealType" name="mealType"
                                            value={createForm.mealType} onChange={handleCreateChange} disabled={saving}>
                                        <option value="LUNCH">Lunch</option>
                                        <option value="DINNER">Dinner</option>
                                    </select>
                                </div>
                                <div className="mc-field">
                                    <label htmlFor="mc-mealMenu">Meal Menu</label>
                                    <input id="mc-mealMenu" name="mealMenu" placeholder="e.g. Rice, Dal, Chicken"
                                           value={createForm.mealMenu} onChange={handleCreateChange} required disabled={saving} />
                                </div>
                                <div className="mc-field">
                                    <label htmlFor="mc-mealPrice">Price (৳)</label>
                                    <input id="mc-mealPrice" type="number" min="0" name="mealPrice"
                                           value={createForm.mealPrice} onChange={handleCreateChange} required disabled={saving} />
                                </div>
                                <div className="mc-field">
                                    <label htmlFor="mc-cutTokenBefore">Cut Token Before</label>
                                    <input id="mc-cutTokenBefore" type="time" name="cutTokenBefore"
                                           value={createForm.cutTokenBefore} onChange={handleCreateChange} required disabled={saving} />
                                </div>
                                <div className="mc-field">
                                    <label htmlFor="mc-tokenExpires">Token Expires</label>
                                    <input id="mc-tokenExpires" type="time" name="tokenExpires"
                                           value={createForm.tokenExpires} onChange={handleCreateChange} required disabled={saving} />
                                </div>
                                <div className="mc-field mc-field--full">
                                    <label htmlFor="mc-feastNote">Feast Note <span className="mc-optional">(optional)</span></label>
                                    <input id="mc-feastNote" name="feastNote" placeholder="Special occasion or note…"
                                           value={createForm.feastNote} onChange={handleCreateChange} disabled={saving} />
                                </div>
                            </div>
                            <div className="mc-form-actions">
                                <button type="submit" className="mc-btn mc-btn--primary" disabled={saving}>
                                    {saving
                                        ? <><span className="mc-spinner-sm" /> Creating…</>
                                        : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create Meal Config</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

            </div>

            {/* ═══════════════════════════════════════════════
                FLOATING EDIT MODAL
            ═══════════════════════════════════════════════ */}
            {editingId && editableConfig && (
                <>
                    {/* backdrop */}
                    <div className="mc-overlay" onClick={closeModal} aria-hidden="true" />

                    {/* floating panel */}
                    <div className="mc-modal" role="dialog" aria-modal="true" aria-labelledby="mc-modal-title">
                        {/* modal header */}
                        <div className="mc-modal-header">
                            <div className="mc-modal-title-wrap">
                                <div
                                    className="mc-modal-type-dot"
                                    style={{ background: getMC(editableConfig.mealType).strip }}
                                />
                                <div>
                                    <h2 id="mc-modal-title" className="mc-modal-title">Update Meal Config</h2>
                                    <p className="mc-modal-sub">
                                        {formatDate(editableConfig.mealDate)} &nbsp;·&nbsp;{' '}
                                        {editableConfig.mealType.charAt(0) + editableConfig.mealType.slice(1).toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mc-modal-close"
                                onClick={closeModal}
                                aria-label="Close edit modal"
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* modal body */}
                        <div className="mc-modal-body">
                            <form onSubmit={handleUpdate} id="mc-modal-form">
                                <div className="mc-form-grid">
                                    <div className="mc-field">
                                        <label htmlFor="upd-mealMenu">Meal Menu</label>
                                        <input id="upd-mealMenu" name="mealMenu"
                                               value={updateForm.mealMenu} onChange={handleUpdateChange} required disabled={saving} />
                                    </div>
                                    <div className="mc-field">
                                        <label htmlFor="upd-mealPrice">Price (৳)</label>
                                        <input id="upd-mealPrice" type="number" min="0" name="mealPrice"
                                               value={updateForm.mealPrice} onChange={handleUpdateChange} required disabled={saving} />
                                    </div>
                                    <div className="mc-field">
                                        <label htmlFor="upd-cutTokenBefore">Cut Token Before</label>
                                        <input id="upd-cutTokenBefore" type="time" name="cutTokenBefore"
                                               value={updateForm.cutTokenBefore} onChange={handleUpdateChange} required disabled={saving} />
                                    </div>
                                    <div className="mc-field">
                                        <label htmlFor="upd-tokenExpires">Token Expires</label>
                                        <input id="upd-tokenExpires" type="time" name="tokenExpires"
                                               value={updateForm.tokenExpires} onChange={handleUpdateChange} required disabled={saving} />
                                    </div>
                                    <div className="mc-field mc-field--full">
                                        <label htmlFor="upd-feastNote">Feast Note <span className="mc-optional">(optional)</span></label>
                                        <input id="upd-feastNote" name="feastNote" placeholder="Special occasion or note…"
                                               value={updateForm.feastNote} onChange={handleUpdateChange} disabled={saving} />
                                    </div>

                                    {/* ── Booking Active toggle ── */}
                                    <div className="mc-field mc-field--full">
                                        <label className="mc-toggle-label">
                                            <div className="mc-toggle-info">
                                                <span className="mc-toggle-title">Booking Active</span>
                                                <span className="mc-toggle-hint">Allow students to purchase tokens for this meal</span>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={updateForm.isActive}
                                                className={`mc-toggle-switch${updateForm.isActive ? ' mc-toggle-switch--on' : ''}`}
                                                onClick={() =>
                                                    setUpdateForm((p) => ({ ...p, isActive: !p.isActive }))
                                                }
                                                disabled={saving}
                                            >
                                                <span className="mc-toggle-thumb" />
                                            </button>
                                        </label>
                                        <p className={`mc-toggle-status${updateForm.isActive ? ' mc-toggle-status--on' : ' mc-toggle-status--off'}`}>
                                            {updateForm.isActive
                                                ? '✓ Booking is currently active'
                                                : '✗ Booking is currently inactive'}
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* modal footer */}
                        <div className="mc-modal-footer">
                            <button
                                type="button"
                                className="mc-btn mc-btn--ghost"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="mc-modal-form"
                                className="mc-btn mc-btn--primary"
                                disabled={saving}
                            >
                                {saving
                                    ? <><span className="mc-spinner-sm" /> Saving…</>
                                    : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};