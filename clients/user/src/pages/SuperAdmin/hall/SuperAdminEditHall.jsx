import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export function SuperAdminEditHall() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        shortName: '',
        genderType: 'MALE',
        bkashNumber: '',
        nagadNumber: '',
        hallAdminId: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchHall = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getHallById(id);
                const hall = response.data;
                setFormData({
                    fullName: hall.fullName || '',
                    shortName: hall.shortName || '',
                    genderType: hall.genderType || 'MALE',
                    bkashNumber: hall.bkashNumber || '',
                    nagadNumber: hall.nagadNumber || '',
                    hallAdminId: hall.hallAdminId || '',
                });
            } catch (err) {
                console.error('Fetch hall for edit error:', err);
                setError('Failed to load hall data. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchHall();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        if (formData.fullName.length < 2 || formData.fullName.length > 100) {
            setError('Hall name must be between 2-100 characters');
            setSaving(false);
            return;
        }

        if (formData.shortName.length < 2 || formData.shortName.length > 100) {
            setError('Short name must be between 2-100 characters');
            setSaving(false);
            return;
        }

        try {
            const payload = { ...formData };
            if (!payload.hallAdminId) {
                delete payload.hallAdminId;
            }

            await superAdminAPI.updateHall(id, payload);
            setSuccess('Hall updated successfully! Redirecting...');
            setTimeout(() => {
                navigate(`/superAdmin/halls/${id}`);
            }, 1500);
        } catch (err) {
            console.error('Update hall error:', err);

            if (err.response?.status === 403) {
                setError('You do not have permission to update halls');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || 'Failed to update hall');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to={`/superAdmin/halls/${id}`} className="back-link">← Back to Hall Details</Link>

            <div className="card">
                <h1 className="page-title">Update Hall</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                {loading ? (
                    <div className="empty-state">
                        <p>Loading hall information...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">Hall Full Name *</label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Jananeta Abdul Mannan Hall"
                                disabled={saving}
                                maxLength="100"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="shortName">Short Name *</label>
                                <input
                                    id="shortName"
                                    type="text"
                                    name="shortName"
                                    value={formData.shortName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., JAMH"
                                    disabled={saving}
                                    maxLength="100"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="genderType">Gender Type *</label>
                                <select
                                    id="genderType"
                                    name="genderType"
                                    value={formData.genderType}
                                    onChange={handleChange}
                                    required
                                    disabled={saving}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="bkashNumber">Bkash Number</label>
                                <input
                                    id="bkashNumber"
                                    type="text"
                                    name="bkashNumber"
                                    value={formData.bkashNumber}
                                    onChange={handleChange}
                                    placeholder="e.g., 01700000000"
                                    disabled={saving}
                                    maxLength="15"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nagadNumber">Nagad Number</label>
                                <input
                                    id="nagadNumber"
                                    type="text"
                                    name="nagadNumber"
                                    value={formData.nagadNumber}
                                    onChange={handleChange}
                                    placeholder="e.g., 01800000000"
                                    disabled={saving}
                                    maxLength="15"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hallAdminId">Hall Admin ID (Optional)</label>
                            <input
                                id="hallAdminId"
                                type="text"
                                name="hallAdminId"
                                value={formData.hallAdminId}
                                onChange={handleChange}
                                placeholder="Admin ID if assigning now"
                                disabled={saving}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Hall'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/superAdmin/halls/${id}`)}
                                className="btn btn-cancel"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}


