import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const SuperAdminAdminDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdmin = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getAdminById(id);
                setAdmin(response.data);
            } catch (err) {
                console.error('Fetch admin details error:', err);
                setError('Failed to load hall admin details. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, [id]);

    const handleStatusChange = async () => {
        if (!admin) return;

        const nextStatus = admin.isActive ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${nextStatus} this hall admin?`)) {
            return;
        }

        setSaving(true);
        try {
            if (admin.isActive) {
                await superAdminAPI.suspendAdmin(admin.id);
            } else {
                await superAdminAPI.activateAdmin(admin.id);
            }

            setAdmin((currentAdmin) => currentAdmin ? { ...currentAdmin, isActive: !currentAdmin.isActive } : currentAdmin);
        } catch (err) {
            alert(`Failed to ${nextStatus} hall admin: ` + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/admins" className="back-link">← Back to Hall Admins</Link>

            <div className="card">
                <div className="detail-header">
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Hall Admin Details</h1>
                        <p className="detail-subtitle">View and manage hall admin information</p>
                    </div>
                    <div className="detail-header-actions">
                        <button
                            className={`btn ${admin?.isActive ? 'btn-suspend' : 'btn-activate'}`}
                            onClick={handleStatusChange}
                            disabled={saving || loading || !admin}
                        >
                            {saving ? 'Updating...' : admin?.isActive ? 'Suspend Hall Admin' : 'Activate Hall Admin'}
                        </button>
                    </div>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading hall admin details...</p>
                    </div>
                ) : admin ? (
                    <div className="detail-grid">
                        <div className="detail-card">
                            <span className="detail-label">Full Name</span>
                            <span className="detail-value">{admin.fullName}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{admin.email}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Phone</span>
                            <span className="detail-value">{admin.phone || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Role</span>
                            <span className="detail-value">{admin.role}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Hall</span>
                            <span className="detail-value">{admin.hallShortName || admin.hallId || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Status</span>
                            <span className={`badge ${admin.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                {admin.isActive ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Created At</span>
                            <span className="detail-value">{admin.createdAt || '-'}</span>
                        </div>
                        <div className="detail-card">
                            <span className="detail-label">Updated At</span>
                            <span className="detail-value">{admin.updatedAt || '-'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>Hall admin not found</h3>
                        <p>The hall admin may have been removed or the ID is invalid.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/superAdmin/admins')}>
                            Back to Hall Admins
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

