import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hallAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const CreateHall = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        shortName: '',
        genderType: 'MALE',
        bkashNumber: '',
        nagadNumber: '',
        hallAdminId: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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
        setLoading(true);

        // Validation
        if (formData.fullName.length < 2 || formData.fullName.length > 100) {
            setError('Hall name must be between 2-100 characters');
            setLoading(false);
            return;
        }
        if (formData.shortName.length < 2 || formData.shortName.length > 100) {
            setError('Short name must be between 2-100 characters');
            setLoading(false);
            return;
        }

        try {
            // Remove empty hallAdminId if not provided
            const payload = { ...formData };
            if (!payload.hallAdminId) {
                delete payload.hallAdminId;
            }

            const response = await hallAPI.createHall(payload);
            console.log('Hall created:', response);

            setSuccess('Hall created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/superAdmin/halls');
            }, 2000);
        } catch (err) {
            console.error('Create hall error:', err);

            if (err.response?.status === 403) {
                setError('You do not have permission to create halls');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || 'Failed to create hall');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Create New Hall</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

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
                            disabled={loading}
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
                                disabled={loading}
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
                                disabled={loading}
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
                                disabled={loading}
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
                                disabled={loading}
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
                            disabled={loading}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Hall'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/superAdmin/halls')}
                            className="btn btn-cancel"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
