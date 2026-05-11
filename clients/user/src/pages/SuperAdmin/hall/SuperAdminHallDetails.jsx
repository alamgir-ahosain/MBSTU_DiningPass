import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const SuperAdminHallDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHall = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getHallById(id);
                setHall(response.data);
            } catch (err) {
                console.error('Fetch hall details error:', err);
                setError('Failed to load hall details. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchHall();
    }, [id]);

    const handleStatusChange = async () => {
        if (!hall) return;

        const nextStatus = hall.isActive ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${nextStatus} this hall?`)) {
            return;
        }

        setSaving(true);
        try {
            if (hall.isActive) {
                await superAdminAPI.suspendHall(hall.id);
            } else {
                await superAdminAPI.activateHall(hall.id);
            }

            setHall((currentHall) => currentHall ? { ...currentHall, isActive: !currentHall.isActive } : currentHall);
        } catch (err) {
            alert(`Failed to ${nextStatus} hall: ` + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/halls" className="back-link">← Back to Halls</Link>

            <div className="card">
                <div className="detail-header">
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Hall Details</h1>
                        <p className="detail-subtitle">View and manage hall information</p>
                    </div>
                    <div className="detail-header-actions">
                        <Link to={`/superAdmin/halls/${id}/edit`} className="btn btn-edit">
                            Update Hall
                        </Link>
                        <button
                            className={`btn ${hall?.isActive ? 'btn-suspend' : 'btn-activate'}`}
                            onClick={handleStatusChange}
                            disabled={saving || loading || !hall}
                        >
                            {saving ? 'Updating...' : hall?.isActive ? 'Suspend Hall' : 'Activate Hall'}
                        </button>
                    </div>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading hall details...</p>
                    </div>
                ) : hall ? (
                    <div className="detail-grid">
                        <div className="detail-card">
                            <span className="detail-label">Full Name</span>
                            <span className="detail-value">{hall.fullName}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Short Name</span>
                            <span className="detail-value">{hall.shortName}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Gender Type</span>
                            <span className="detail-value">{hall.genderType}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Bkash Number</span>
                            <span className="detail-value">{hall.bkashNumber || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Nagad Number</span>
                            <span className="detail-value">{hall.nagadNumber || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Hall Admin ID</span>
                            <span className="detail-value">{hall.hallAdminId || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Status</span>
                            <span className={`badge ${hall.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                {hall.isActive ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Created At</span>
                            <span className="detail-value">{hall.createdAt || '-'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>Hall not found</h3>
                        <p>The hall may have been removed or the ID is invalid.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/superAdmin/halls')}>
                            Back to Halls
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

