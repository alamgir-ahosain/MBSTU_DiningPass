import { useEffect, useState } from 'react';
import { hallAdminAPI } from '../../../services/api';
import './HallAdminStaff.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const emptyForm = {
    fullName: '',
    email:    '',
    password: '',
    phone:    '',
};

/* —— Confirm Modal —————————————————————————————————————— */
const ConfirmModal = ({ staff, onConfirm, onCancel }) => {
    const isActivating = !staff.isActive;
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onCancel]);

    return (
        <>
            <div className="hs-overlay" onClick={onCancel} aria-hidden="true" />
            <div className="hs-modal hs-modal--confirm" role="dialog" aria-modal="true">
                <div className="hs-modal-header">
                    <div className={`hs-confirm-icon hs-confirm-icon--${isActivating ? 'activate' : 'suspend'}`}>
                        {isActivating ? (
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        ) : (
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                        )}
                    </div>
                    <button type="button" className="hs-modal-close" onClick={onCancel} aria-label="Close">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="hs-modal-body hs-modal-body--confirm">
                    <h3 className="hs-confirm-title">
                        {isActivating ? 'Activate Staff Account' : 'Suspend Staff Account'}
                    </h3>
                    <p className="hs-confirm-text">
                        Are you sure you want to <strong>{isActivating ? 'activate' : 'suspend'}</strong> the account for{' '}
                        <strong>{staff.fullName || staff.email}</strong>?
                        {!isActivating && ' They will lose access immediately.'}
                    </p>
                </div>
                <div className="hs-modal-footer">
                    <button type="button" className="hs-btn hs-btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`hs-btn ${isActivating ? 'hs-btn--activate' : 'hs-btn--suspend'}`}
                        onClick={onConfirm}
                    >
                        {isActivating ? 'Yes, Activate' : 'Yes, Suspend'}
                    </button>
                </div>
            </div>
        </>
    );
};

/* —— Main Component ————————————————————————————————————— */
export const HallAdminStaff = () => {
    const [staffList,    setStaffList]    = useState([]);
    const [myProfile,    setMyProfile]    = useState(null);
    const [formData,     setFormData]     = useState(emptyForm);
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState('');
    const [success,      setSuccess]      = useState('');
    const [confirmStaff, setConfirmStaff] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [staffRes, profileRes] = await Promise.all([
                hallAdminAPI.getHallStaff({ role: 'HALL_STAFF' }),
                hallAdminAPI.getMyProfile(),
            ]);
            setMyProfile(profileRes.data);
            setStaffList(getItems(staffRes.data));
        } catch (err) {
            setError('Failed to load staff data. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setSaving(true); setError(''); setSuccess('');
        try {
            await hallAdminAPI.createHallStaff({
                fullName:      formData.fullName,
                email:         formData.email,
                password:      formData.password,
                phone:         formData.phone,
                role:          'HALL_STAFF',
                hallShortName: myProfile?.hallShortName,
            });
            setSuccess('Hall staff account created successfully.');
            setFormData(emptyForm);
            await loadData();
        } catch (err) {
            setError('Failed to create hall staff. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmToggle = async () => {
        if (!confirmStaff) return;
        const staff      = confirmStaff;
        const nextActive = !staff.isActive;
        setConfirmStaff(null);
        try {
            await hallAdminAPI.toggleHallStaffStatus(staff.id, nextActive);
            await loadData();
        } catch (err) {
            setError(`Failed to ${nextActive ? 'activate' : 'suspend'} staff. ` + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="hs-wrapper">

            {/* Banner */}
            <div className="hs-banner">
                <div className="hs-banner-inner">
                    <div className="hs-banner-icon" aria-hidden="true">
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="hs-banner-title">Hall Staff Management</h1>
                        <p className="hs-banner-sub">Create staff accounts and manage active / suspended status</p>
                    </div>
                    {!loading && (
                        <div className="hs-banner-stat">
                            <span className="hs-banner-stat-num">{staffList.length}</span>
                            <span className="hs-banner-stat-label">Staff</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="hs-main">

                {/* Alerts */}
                {error && (
                    <div className="hs-alert hs-alert--error">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="hs-alert hs-alert--success">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {success}
                    </div>
                )}

                {/* Section 1: Create form */}
                <section className="hs-section">
                    <div className="hs-section-head">
                        <h2>Create Staff Account</h2>
                    </div>
                    <div className="hs-form-card">
                        <form onSubmit={handleCreateStaff}>
                            <div className="hs-form-grid">

                                <div className="hs-field">
                                    <label htmlFor="hs-fullName">Full Name</label>
                                    <input
                                        id="hs-fullName" name="fullName"
                                        placeholder="e.g. Md. Rahim Uddin"
                                        value={formData.fullName}
                                        onChange={handleFormChange}
                                        required disabled={saving}
                                    />
                                </div>

                                <div className="hs-field">
                                    <label htmlFor="hs-email">Email Address</label>
                                    <input
                                        id="hs-email" type="email" name="email"
                                        placeholder="staff@example.com"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required disabled={saving}
                                    />
                                </div>

                                <div className="hs-field">
                                    <label htmlFor="hs-password">Password</label>
                                    <input
                                        id="hs-password" type="password" name="password"
                                        placeholder="Min. 6 characters"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        minLength={6} required disabled={saving}
                                    />
                                </div>

                                <div className="hs-field">
                                    <label htmlFor="hs-phone">
                                        Phone <span className="hs-optional">(optional)</span>
                                    </label>
                                    <input
                                        id="hs-phone" name="phone"
                                        placeholder="01XXXXXXXXX"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        disabled={saving}
                                    />
                                </div>

                                {/* Hall — read-only, sourced from admin's profile */}
                                <div className="hs-field">
                                    <label>Hall</label>
                                    <div className="hs-field-readonly">
                                        {myProfile?.hallShortName ? (
                                            <span className="hs-hall-tag">{myProfile.hallShortName}</span>
                                        ) : (
                                            <span className="hs-field-readonly-empty">—</span>
                                        )}
                                        <span className="hs-field-readonly-hint">Assigned from your profile</span>
                                    </div>
                                </div>

                            </div>
                            <div className="hs-form-actions">
                                <button type="submit" className="hs-btn hs-btn--primary" disabled={saving || !myProfile?.hallShortName}>
                                    {saving ? (
                                        <><span className="hs-spinner-sm" /> Creating…</>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            Create Hall Staff
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Section 2: Staff list */}
                <section className="hs-section">
                    <div className="hs-section-head">
                        <h2>All Hall Staff</h2>
                        {!loading && <span className="hs-count">{staffList.length}</span>}
                    </div>

                    {loading ? (
                        <div className="hs-loading">
                            <div className="hs-spinner" />
                            <p>Loading staff members…</p>
                        </div>
                    ) : staffList.length === 0 ? (
                        <div className="hs-empty">
                            <div className="hs-empty-icon">
                                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <h3>No staff found</h3>
                            <p>Create your first hall staff account using the form above.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hs-table-wrap">
                                <table className="hs-table">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Hall</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {staffList.map((staff, idx) => (
                                        <tr key={staff.id}>
                                            <td className="hs-td-idx">{idx + 1}</td>
                                            <td className="hs-td-name">{staff.fullName || '—'}</td>
                                            <td className="hs-td-email">{staff.email || '—'}</td>
                                            <td>{staff.phone || '—'}</td>
                                            <td>
                                                <span className="hs-hall-tag">{staff.hallShortName || '—'}</span>
                                            </td>
                                            <td>
                                                <span className={`hs-badge ${staff.isActive ? 'hs-badge--active' : 'hs-badge--inactive'}`}>
                                                    <span className="hs-badge-dot" />
                                                    {staff.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`hs-btn-sm ${staff.isActive ? 'hs-btn-sm--suspend' : 'hs-btn-sm--activate'}`}
                                                    onClick={() => setConfirmStaff(staff)}
                                                >
                                                    {staff.isActive ? (
                                                        <>
                                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                            </svg>
                                                            Suspend
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                            </svg>
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="hs-cards">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="hs-staff-card">
                                        <div className="hs-staff-card-head">
                                            <div className="hs-staff-avatar">
                                                {(staff.fullName || 'S').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hs-staff-info">
                                                <span className="hs-staff-name">{staff.fullName || '—'}</span>
                                                <span className="hs-staff-email">{staff.email || '—'}</span>
                                            </div>
                                            <span className={`hs-badge ${staff.isActive ? 'hs-badge--active' : 'hs-badge--inactive'}`}>
                                                <span className="hs-badge-dot" />
                                                {staff.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </div>
                                        <dl className="hs-staff-details">
                                            <div className="hs-staff-row">
                                                <dt>Phone</dt>
                                                <dd>{staff.phone || '—'}</dd>
                                            </div>
                                            <div className="hs-staff-row">
                                                <dt>Hall</dt>
                                                <dd><span className="hs-hall-tag">{staff.hallShortName || '—'}</span></dd>
                                            </div>
                                        </dl>
                                        <div className="hs-staff-card-actions">
                                            <button
                                                type="button"
                                                className={`hs-btn hs-btn--block ${staff.isActive ? 'hs-btn--suspend' : 'hs-btn--activate'}`}
                                                onClick={() => setConfirmStaff(staff)}
                                            >
                                                {staff.isActive ? (
                                                    <>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                        </svg>
                                                        Suspend Account
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                        Activate Account
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

            </div>

            {/* Confirm Modal */}
            {confirmStaff && (
                <ConfirmModal
                    staff={confirmStaff}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setConfirmStaff(null)}
                />
            )}
        </div>
    );
};