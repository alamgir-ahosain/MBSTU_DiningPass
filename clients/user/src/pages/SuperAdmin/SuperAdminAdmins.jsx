import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import './SuperAdminPages.css';

export const SuperAdminAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'HALL_ADMIN',
        hallId: '',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getAllAdmins();
                console.log('Admins response:', response);
                setAdmins(response.data || []);
            } catch (err) {
                console.error('Fetch admins error:', err);
                setError('Failed to load administrators. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await superAdminAPI.createAdmin(formData);
            setAdmins([...admins, response.data]);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                role: 'HALL_ADMIN',
                hallId: '',
            });
            setShowCreateForm(false);
        } catch (err) {
            alert('Failed to create admin: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    };

    const handleSuspend = async (adminId) => {
        if (window.confirm('Are you sure you want to suspend this administrator?')) {
            try {
                await superAdminAPI.suspendAdmin(adminId);
                setAdmins(admins.map(a => a.id === adminId ? { ...a, isActive: false } : a));
            } catch (err) {
                alert('Failed to suspend admin: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Administrators</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? '✕ Close' : '➕ Create Admin'}
                    </button>
                </div>

                {error && <div className="message error">{error}</div>}

                {showCreateForm && (
                    <form onSubmit={handleCreateAdmin} className="admin-form" style={{ marginBottom: '2rem' }}>
                        <h3>Create New Administrator</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name *</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Administrator name"
                                    disabled={creating}
                                    maxLength="100"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="email@university.edu"
                                    disabled={creating}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="Phone number"
                                    disabled={creating}
                                    maxLength="15"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role *</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    required
                                    disabled={creating}
                                >
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="HALL_ADMIN">Hall Admin</option>
                                    <option value="COUNTER_STAFF">Counter Staff</option>
                                    <option value="HALL_STAFF">Hall Staff</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hallId">Hall ID *</label>
                            <input
                                id="hallId"
                                type="text"
                                name="hallId"
                                value={formData.hallId}
                                onChange={handleFormChange}
                                required
                                placeholder="UUID of assigned hall"
                                disabled={creating}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="btn btn-primary" disabled={creating}>
                                {creating ? 'Creating...' : 'Create Admin'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => setShowCreateForm(false)}
                                disabled={creating}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading administrators...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="empty-state">
                        <h3>No administrators yet</h3>
                        <p>Create administrators to manage halls and staff</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Hall ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td>{admin.fullName}</td>
                                        <td>{admin.email}</td>
                                        <td>{admin.phone || '-'}</td>
                                        <td><strong>{admin.role}</strong></td>
                                        <td>{admin.hallId}</td>
                                        <td>
                                            <span className={`badge ${admin.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {admin.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/superAdmin/admins/${admin.id}`} className="btn-small btn-view">View</Link>
                                                {admin.isActive && (
                                                    <button
                                                        className="btn-small btn-suspend"
                                                        onClick={() => handleSuspend(admin.id)}
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
