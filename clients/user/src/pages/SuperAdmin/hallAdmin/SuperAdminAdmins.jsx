import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const SuperAdminAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getAllAdmins({ role: 'HALL_ADMIN' });
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

    // createdAt/updatedAt columns removed from list view — details page shows formatted values

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Hall Admins</h1>
                    <Link to="/superAdmin/create-admin" className="btn btn-primary">
                         Create Hall Admin
                    </Link>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading administrators...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hall admins yet</h3>
                        <p>Create your first hall admin to manage a hall</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Hall</th>
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
                                        <td>{admin.hallShortName || admin.hallId || '-'}</td>

                                        <td>
                                            <span className={`badge ${admin.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {admin.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/superAdmin/admins/${admin.id}`} className="btn-small btn-view">View Profile</Link>
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
