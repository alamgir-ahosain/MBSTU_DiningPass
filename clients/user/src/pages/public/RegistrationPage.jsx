import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import './PublicPages.css';

export const RegistrationPage = () => {
    const hallOptions = [
        { shortName: 'JAMH', fullName: 'Jananeta Abdul Mannan Hall' },
        { shortName: 'SOHH', fullName: 'Shaheed Osman Hadi Hall' },
        { shortName: 'SAFH', fullName: 'Shaheed Abrar Fahad Hall' },
        { shortName: 'SZRH', fullName: 'Shahid Ziaur Rahman Hall' },
        { shortName: 'SJJIM', fullName: 'Shahid Janoni Jahanara Imam Hall' },
        { shortName: 'AKBH', fullName: 'Alema Khatun Bhashani Hall' },
        { shortName: 'BFZH', fullName: 'Begum Fazilatunnessa Zoha Hall' },
    ];

    const departmentOptions = [
        'Computer Science and Engineering',
        'Information and Communication Technology',
        'Criminology and Police Science',
        'Textile Engineering',
    ];

    const [formData, setFormData] = useState({
        studentId: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        hallShortName: '',
        roomNumber: '',
        department: '',
        gender: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        if (!formData.fullName || !formData.studentId || !formData.hallShortName || !formData.department || !formData.gender) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        try {
            const studentData = {
                studentId: formData.studentId,
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                hallShortName: formData.hallShortName,
                roomNumber: formData.roomNumber || null,
                department: formData.department,
                gender: formData.gender,
            };
            const response = await studentAPI.register(studentData);
            console.log('Student registered successfully:', response);
            setSuccess('Registration successful! Redirecting to login…');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.status === 400) {
                setError(err.response.data.message || 'Invalid registration data.');
            } else if (err.response?.status === 409) {
                setError('Email or Student ID already exists.');
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pp-page">
            <div className="form-container">
                <div className="form-inner">
                    <div className="rule-badge">Registration as MBSTUian</div>
                    <h1>Create Account</h1>
                    <p className="form-subtitle">Fill in your details to register as a student</p>
                    <div className="form-divider" />

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit}>

                        {/* ── Personal Info ── */}
                        <div className="form-section-label">Personal Information</div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="studentId">Student ID</label>
                                <input
                                    id="studentId"
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                    placeholder="CE21012"
                                    maxLength="20"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="roomNumber">
                                    Room No.{' '}
                                    <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.68rem', color: '#a08080' }}>
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    id="roomNumber"
                                    type="text"
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    placeholder="112"
                                    maxLength="15"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Alamgir Hosain"
                                maxLength="100"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="CE21012@mbstu.ac.bd"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <div className="gender-options">
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="MALE"
                                        checked={formData.gender === 'MALE'}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    Male
                                </label>
                                <label className="radio-card">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="FEMALE"
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    Female
                                </label>
                            </div>
                        </div>

                        {/* ── Academic Info ── */}
                        <div className="form-section-label">Academic Details</div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select department</option>
                                    {departmentOptions.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="hallShortName">Residential Hall</label>
                                <select
                                    id="hallShortName"
                                    name="hallShortName"
                                    value={formData.hallShortName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select hall</option>
                                    {hallOptions.map((hall) => (
                                        <option key={hall.shortName} value={hall.shortName}>
                                            {hall.fullName} ({hall.shortName})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ── Security ── */}
                        <div className="form-section-label">Security</div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Min. 6 characters"
                                    minLength="6"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Re-enter password"
                                    minLength="6"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <input
                                id="role"
                                type="text"
                                value="STUDENT"
                                disabled
                                className="disabled-input"
                            />
                            <small>Automatically set to STUDENT for all registrations</small>
                        </div>

                        <button type="submit" className="form-button" disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
