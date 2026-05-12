import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { superAdminAPI } from '../../../services/api';
import '../SuperAdminPages.css';

export const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'HALL_ADMIN',
        hallShortName: '',
        password: '',
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

        if (formData.fullName.length < 2 || formData.fullName.length > 100) {
            setError('Full name must be between 2-100 characters');
            setLoading(false);
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await superAdminAPI.createAdmin(formData);
            console.log('Hall admin created:', response);

            setSuccess('Hall admin created successfully! Redirecting...');
            setTimeout(() => {
                navigate('/superAdmin/admins');
            }, 2000);
        } catch (err) {
            console.error('Create hall admin error:', err);

            if (err.response?.status === 403) {
                setError('You do not have permission to create hall admins');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError(err.message || 'Failed to create hall admin');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/admins" className="back-link">← Back to Hall Admins</Link>

            <div className="card">
                <h1 className="page-title">Create New Hall Admin</h1>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Md. Rahman"
                            disabled={loading}
                            maxLength="100"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@university.edu"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g., 01700000000"
                                disabled={loading}
                                maxLength="15"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} disabled={loading}>
                                <option value="HALL_ADMIN">Hall Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="hallShortName">Hall Short Name *</label>
                            <input
                                id="hallShortName"
                                type="text"
                                name="hallShortName"
                                value={formData.hallShortName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., JAMH"
                                disabled={loading}
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Min 6 characters"
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Hall Admin'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/superAdmin/admins')}
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

