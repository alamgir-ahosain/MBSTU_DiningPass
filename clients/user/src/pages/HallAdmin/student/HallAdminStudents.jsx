import { useEffect, useState } from 'react';
import { hallAdminAPI } from '../../../services/api';
import './HallAdminStudents.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const ConfirmModal = ({ student, onConfirm, onCancel }) => {
    const isActivating = !student.isActive;
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
            <div className="st-overlay" onClick={onCancel} aria-hidden="true" />
            <div className="st-modal st-modal--confirm" role="dialog" aria-modal="true">
                <div className="st-modal-header">
                    <div className={`st-confirm-icon st-confirm-icon--${isActivating ? 'activate' : 'suspend'}`}>
                        {isActivating ? (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                        )}
                    </div>
                    <button type="button" className="st-modal-close" onClick={onCancel} aria-label="Close">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="st-modal-body st-modal-body--confirm">
                    <h3 className="st-confirm-title">
                        {isActivating ? 'Activate Student Account' : 'Suspend Student Account'}
                    </h3>
                    <p className="st-confirm-text">
                        Are you sure you want to <strong>{isActivating ? 'activate' : 'suspend'}</strong> the account for{' '}
                        <strong>{student.fullName || student.studentId || student.email}</strong>?
                        {!isActivating && ' They will lose access immediately.'}
                    </p>
                </div>
                <div className="st-modal-footer">
                    <button type="button" className="st-btn st-btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`st-btn ${isActivating ? 'st-btn--activate' : 'st-btn--suspend'}`}
                        onClick={onConfirm}
                    >
                        {isActivating ? 'Yes, Activate' : 'Yes, Suspend'}
                    </button>
                </div>
            </div>
        </>
    );
};

function highlight(text, query) {
    if (!query || !text) return text || '';
    const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="st-highlight">{part}</mark>
            : part
    );
}

export const HallAdminStudents = () => {
    const [students,       setStudents]       = useState([]);
    const [page,           setPage]           = useState(0);
    const [totalPages,     setTotalPages]     = useState(1);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState('');
    const [confirmStudent, setConfirmStudent] = useState(null);
    const [search,         setSearch]         = useState({ name: '', room: '', dept: '', status: '' });

    const loadStudents = async (targetPage = 0) => {
        setLoading(true);
        setError('');
        try {
            const response = await hallAdminAPI.getStudents({ page: targetPage, size: 20 });
            const payload  = response.data;
            setStudents(getItems(payload));
            setPage(typeof payload?.number     === 'number' ? payload.number     : targetPage);
            setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 1);
        } catch (err) {
            setError('Failed to load students. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(page); }, [page]);

    const handleConfirmToggle = async () => {
        if (!confirmStudent) return;
        const student    = confirmStudent;
        const nextActive = !student.isActive;
        setConfirmStudent(null);
        try {
            await hallAdminAPI.suspendStudent(student.id);
            await loadStudents(page);
        } catch (err) {
            setError(`Failed to ${nextActive ? 'activate' : 'suspend'} student. ` + (err.response?.data?.message || err.message));
        }
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    const clearSearch = () => setSearch({ name: '', room: '', dept: '', status: '' });

    const hasFilter = search.name || search.room || search.dept || search.status;

    const filtered = students.filter(s => {
        if (search.name   && !(s.fullName   || '').toLowerCase().includes(search.name.toLowerCase()))   return false;
        if (search.room   && !(s.roomNumber || '').toLowerCase().includes(search.room.toLowerCase()))   return false;
        if (search.dept   && !(s.department || '').toLowerCase().includes(search.dept.toLowerCase()))   return false;
        if (search.status === 'active'    && !s.isActive) return false;
        if (search.status === 'suspended' &&  s.isActive) return false;
        return true;
    });

    const totalSafe = Math.max(1, totalPages);

    return (
        <div className="st-wrapper">

            {/* Banner */}
            <div className="st-banner">
                <div className="st-banner-inner">
                    <div className="st-banner-icon" aria-hidden="true">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="st-banner-title">Students</h1>
                        <p className="st-banner-sub">View all hall students and manage account status</p>
                    </div>
                    {!loading && (
                        <div className="st-banner-stat">
                            <span className="st-banner-stat-num">{filtered.length}</span>
                            <span className="st-banner-stat-label">
                                {hasFilter ? 'Matched' : (page > 0 || totalPages > 1 ? `Page ${page + 1}` : 'Students')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="st-main">

                {/* Alert */}
                {error && (
                    <div className="st-alert st-alert--error">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Search Bar */}
                <div className="st-search-bar" role="search">
                    <div className="st-search-group">
                        <label htmlFor="s-name">Name</label>
                        <div className="st-inp-wrap">
                            <svg className="st-inp-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                                id="s-name"
                                type="text"
                                name="name"
                                className="st-search-input"
                                placeholder="Search by name…"
                                value={search.name}
                                onChange={handleSearchChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="st-search-group">
                        <label htmlFor="s-room">Room number</label>
                        <div className="st-inp-wrap">
                            <svg className="st-inp-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V9h6v12"/>
                            </svg>
                            <input
                                id="s-room"
                                type="text"
                                name="room"
                                className="st-search-input"
                                placeholder="e.g. 301"
                                value={search.room}
                                onChange={handleSearchChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="st-search-group">
                        <label htmlFor="s-dept">Department</label>
                        <div className="st-inp-wrap">
                            <svg className="st-inp-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="2" y="7" width="20" height="14" rx="2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                            </svg>
                            <input
                                id="s-dept"
                                type="text"
                                name="dept"
                                className="st-search-input"
                                placeholder="e.g. CSE"
                                value={search.dept}
                                onChange={handleSearchChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="st-search-group st-search-group--select">
                        <label htmlFor="s-status">Status</label>
                        <select
                            id="s-status"
                            name="status"
                            className="st-search-select"
                            value={search.status}
                            onChange={handleSearchChange}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    {hasFilter && (
                        <button type="button" className="st-btn st-btn--ghost st-btn--clear" onClick={clearSearch}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

              

                {/* Content */}
                {loading ? (
                    <div className="st-loading">
                        <div className="st-spinner" />
                        <p>Loading students…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="st-empty">
                        <div className="st-empty-icon">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                            </svg>
                        </div>
                        <h3>{hasFilter ? 'No students matched your search' : 'No students found'}</h3>
                        <p>{hasFilter ? 'Try adjusting or clearing your filters.' : 'Students will appear here after registration.'}</p>
                        {hasFilter && (
                            <button type="button" className="st-btn st-btn--ghost" onClick={clearSearch} style={{ marginTop: '1rem' }}>
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="st-table-wrap">
                            <table className="st-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Room</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((student, idx) => (
                                    <tr key={student.id || student.studentId}>
                                        <td className="st-td-idx">{page * 20 + idx + 1}</td>
                                        <td className="st-td-sid">
                                            <span className="st-sid-tag">{student.studentId || '—'}</span>
                                        </td>
                                        <td className="st-td-name">{highlight(student.fullName, search.name)}</td>
                                        <td className="st-td-email">{student.email || '—'}</td>
                                        <td>{highlight(student.roomNumber, search.room) || '—'}</td>
                                        <td className="st-td-dept">{highlight(student.department, search.dept) || '—'}</td>
                                        <td>
                                            <span className={`st-badge ${student.isActive ? 'st-badge--active' : 'st-badge--inactive'}`}>
                                                <span className="st-badge-dot" />
                                                {student.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`st-btn-sm ${student.isActive ? 'st-btn-sm--suspend' : 'st-btn-sm--activate'}`}
                                                onClick={() => setConfirmStudent(student)}
                                            >
                                                {student.isActive ? (
                                                    <>
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                        </svg>
                                                        Suspend
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
                        <div className="st-cards">
                            {filtered.map((student) => (
                                <div key={student.id || student.studentId} className="st-student-card">
                                    <div className="st-student-card-head">
                                        <div className="st-student-avatar">
                                            {(student.fullName || 'S').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="st-student-info">
                                            <span className="st-student-name">{highlight(student.fullName, search.name)}</span>
                                            <span className="st-student-email">{student.email || '—'}</span>
                                        </div>
                                        <span className={`st-badge ${student.isActive ? 'st-badge--active' : 'st-badge--inactive'}`}>
                                            <span className="st-badge-dot" />
                                            {student.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                    <dl className="st-student-details">
                                        <div className="st-student-row">
                                            <dt>Student ID</dt>
                                            <dd><span className="st-sid-tag">{student.studentId || '—'}</span></dd>
                                        </div>
                                        <div className="st-student-row">
                                            <dt>Room</dt>
                                            <dd>{highlight(student.roomNumber, search.room) || '—'}</dd>
                                        </div>
                                        <div className="st-student-row">
                                            <dt>Department</dt>
                                            <dd>{highlight(student.department, search.dept) || '—'}</dd>
                                        </div>
                                    </dl>
                                    <div className="st-student-card-actions">
                                        <button
                                            type="button"
                                            className={`st-btn st-btn--block ${student.isActive ? 'st-btn--suspend' : 'st-btn--activate'}`}
                                            onClick={() => setConfirmStudent(student)}
                                        >
                                            {student.isActive ? (
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

                {/* Pagination */}
                {!loading && students.length > 0 && (
                    <div className="st-pagination">
                        <button
                            type="button"
                            className="st-btn st-btn--page"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            Previous
                        </button>
                        <div className="st-page-info">
                            <span className="st-page-current">{page + 1}</span>
                            <span className="st-page-sep">of</span>
                            <span className="st-page-total">{totalSafe}</span>
                        </div>
                        <button
                            type="button"
                            className="st-btn st-btn--page"
                            onClick={() => setPage((p) => Math.min(totalSafe - 1, p + 1))}
                            disabled={page + 1 >= totalSafe}
                        >
                            Next
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {confirmStudent && (
                <ConfirmModal
                    student={confirmStudent}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setConfirmStudent(null)}
                />
            )}
        </div>
    );
};