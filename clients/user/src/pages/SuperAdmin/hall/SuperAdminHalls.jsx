import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hallAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const SuperAdminHalls = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHalls = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await hallAPI.getAll();
                console.log('Halls response:', response);
                setHalls(response.data || []);
            } catch (err) {
                console.error('Fetch halls error:', err);
                setError('Failed to load halls. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchHalls();
    }, []);

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>All Halls</h1>
                    <Link to="/superAdmin/create-hall" className="btn btn-primary">
                         Create Hall
                    </Link>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading halls...</p>
                    </div>
                ) : halls.length === 0 ? (
                    <div className="empty-state">
                        <h3>No halls created yet</h3>
                        <p>Create your first hall to get started</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Short Name</th>
                                    <th>Gender Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {halls.map((hall) => (
                                    <tr key={hall.id}>
                                        <td>{hall.fullName}</td>
                                        <td><strong>{hall.shortName}</strong></td>
                                        <td>{hall.genderType}</td>
                                        <td>
                                            <span className={`badge ${hall.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {hall.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/superAdmin/halls/${hall.id}`} className="btn-small btn-view">View Hall</Link>
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
