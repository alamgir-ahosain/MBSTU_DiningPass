import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallAdminAPI } from '../../../services/api';
import '../HallAdminPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const emptyForm = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    hallShortName: '',
};

export const HallAdminStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [staffRes, profileRes] = await Promise.all([
                hallAdminAPI.getHallStaff({ role: 'HALL_STAFF' }),
                hallAdminAPI.getMyProfile(),
            ]);
            const profile = profileRes.data;
            setMyProfile(profile);
            setStaffList(getItems(staffRes.data));
            setFormData((prev) => ({
                ...prev,
                hallShortName: profile?.hallShortName || prev.hallShortName,
            }));
        } catch (err) {
            console.error('Failed to load hall staff data', err);
            setError('Failed to load staff data. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateStaff = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await hallAdminAPI.createHallStaff({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: 'HALL_STAFF',
                hallShortName: formData.hallShortName || myProfile?.hallShortName,
            });
            setSuccess('Hall staff account created successfully.');
            setFormData((prev) => ({ ...emptyForm, hallShortName: prev.hallShortName }));
            await loadData();
        } catch (err) {
            console.error('Failed to create hall staff', err);
            setError('Failed to create hall staff. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (staff) => {
        const nextActive = !staff.isActive;
        const actionText = nextActive ? 'activate' : 'suspend';

        if (window.confirm(`Are you sure you want to ${actionText} this hall staff member?`)) {
            try {
                await hallAdminAPI.toggleHallStaffStatus(staff.id, nextActive);
                await loadData();
            } catch (err) {
                console.error(`Failed to ${actionText} staff`, err);
                setError(`Failed to ${actionText} staff. ` + (err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h1 className="page-title">Hall Staff Management</h1>
                <p className="detail-subtitle">Create hall staff accounts and manage active/suspended status.</p>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleCreateStaff}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input id="fullName" name="fullName" value={formData.fullName} onChange={handleFormChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" type="password" name="password" value={formData.password} onChange={handleFormChange} minLength={6} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input id="phone" name="phone" value={formData.phone} onChange={handleFormChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="hallShortName">Hall Short Name</label>
                            <input id="hallShortName" name="hallShortName" value={formData.hallShortName} onChange={handleFormChange} required />
                        </div>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Hall Staff'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                {loading ? (
                    <div className="empty-state"><p>Loading staff...</p></div>
                ) : staffList.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hall staff found</h3>
                        <p>Create your first hall staff account using the form above.</p>
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
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td>{staff.fullName || '-'}</td>
                                        <td>{staff.email || '-'}</td>
                                        <td>{staff.phone || '-'}</td>
                                        <td>{staff.hallShortName || '-'}</td>
                                        <td>
                                            <span className={`badge ${staff.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {staff.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className={`btn-small ${staff.isActive ? 'btn-suspend' : 'btn-activate'}`}
                                                    onClick={() => handleToggleStatus(staff)}
                                                >
                                                    {staff.isActive ? 'Suspend' : 'Activate'}
                                                </button>
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

