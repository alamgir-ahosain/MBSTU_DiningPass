import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import './PublicPages.css';

export const RegistrationPage = () => {
    // Hall options - short names and full names
    const hallOptions = [
        { shortName: 'JAMH', fullName: 'Jananeta Abdul Mannan Hall' },
        { shortName: 'SOHH', fullName: 'SHAHEED OSMAN HADI HALL' },
        { shortName: 'SAFH', fullName: 'SHAHEED ABRAR FAHAD HALL' },
        { shortName: 'SZRH', fullName: 'Shahid Ziaur Rahman Hall' },
        { shortName: 'SJJIM', fullName: 'Shahid Janoni Jahanara Imam Hall' },
        { shortName: 'AKBH', fullName: 'Alema Khatun Bhashani Hall' },
        { shortName: 'BFZH', fullName: 'BEGUM FAZILATUNNESSA ZOHA HALL' },
    ];

    // Department options
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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate all required fields
        if (!formData.fullName || !formData.studentId || !formData.hallShortName || !formData.department || !formData.gender) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            // Prepare student registration data per backend schema
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

            // Backend will:
            // 1. Create Firebase user with email and password
            // 2. Save student to database with real Firebase UID
            // 3. Set custom claims on Firebase user
            const response = await studentAPI.register(studentData);
            console.log('Student registered successfully:', response);

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);

            if (err.response?.status === 400) {
                setError(err.response.data.message || 'Invalid registration data.');
            } else if (err.response?.status === 409) {
                setError('Email or Student ID already exists. Please try another.');
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="rule-badge">Registration as MBSTUian</div>
            <h1>Register as Student</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>


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
                    <label htmlFor="hallShortName">Residential Hall</label>
                    <select
                        id="hallShortName"
                        name="hallShortName"
                        value={formData.hallShortName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        <option value="">Select a hall</option>
                        {hallOptions.map((hall) => (
                            <option key={hall.shortName} value={hall.shortName}>
                                {hall.fullName} ({hall.shortName})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="roomNumber">Room Number (Optional)</label>
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
                        <option value="">Select a department</option>
                        {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <div className="gender-options">
                        <label className="radio-label">
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
                        <label className="radio-label">
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

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter a strong password (min 6 characters)"
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
                        placeholder="Confirm your password"
                        minLength="6"
                        disabled={loading}
                    />
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
                    <small>Role is automatically set to STUDENT for all users</small>
                </div>

                <button type="submit" className="form-button" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};
