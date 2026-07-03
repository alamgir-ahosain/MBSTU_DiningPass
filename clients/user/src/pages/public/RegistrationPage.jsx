import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import './RegistrationPage.css';

const HALL_OPTIONS = [
    { shortName: 'JAMH',  fullName: 'Jananeta Abdul Mannan Hall'      },
    { shortName: 'SOHH',  fullName: 'Shaheed Osman Hadi Hall'         },
    { shortName: 'SAFH',  fullName: 'Shaheed Abrar Fahad Hall'        },
    { shortName: 'SZRH',  fullName: 'Shahid Ziaur Rahman Hall'        },
    { shortName: 'SJJIM', fullName: 'Shahid Janoni Jahanara Imam Hall'},
    { shortName: 'AKBH',  fullName: 'Alema Khatun Bhashani Hall'      },
    { shortName: 'BFZH',  fullName: 'Begum Fazilatunnessa Zoha Hall'  },
];

const DEPT_OPTIONS = [
    'Computer Science and Engineering',
    'Information and Communication Technology',
    'Criminology and Police Science',
    'Textile Engineering',
];

const STEPS = [
    { label: 'Personal'  },
    { label: 'Academic'  },
    { label: 'Security'  },
];

const CheckIcon = () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
);

export const RegistrationPage = () => {
    const navigate = useNavigate();

    const [step, setStep]       = useState(0);   // 0 | 1 | 2
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        studentId:       '',
        fullName:        '',
        email:           '',
        gender:          '',
        roomNumber:      '',
        department:      '',
        hallShortName:   '',
        password:        '',
        confirmPassword: '',
    });

    const set = (field) => (e) =>
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    // ── Per-step validation ──────────────────────────────────
    const validateStep = () => {
        setError('');
        if (step === 0) {
            if (!formData.studentId.trim()) return setError('Student ID is required.'),    false;
            if (!formData.fullName.trim())  return setError('Full name is required.'),     false;
            if (!formData.email.trim())     return setError('Email address is required.'), false;
            if (!formData.gender)           return setError('Please select a gender.'),    false;
        }
        if (step === 1) {
            if (!formData.department)    return setError('Please select a department.'), false;
            if (!formData.hallShortName) return setError('Please select a hall.'),       false;
        }
        if (step === 2) {
            if (!formData.password)                                return setError('Password is required.'),          false;
            if (formData.password.length < 6)                     return setError('Password must be at least 6 characters.'), false;
            if (formData.password !== formData.confirmPassword)   return setError('Passwords do not match.'),         false;
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        setStep((s) => s + 1);
    };

    const handleBack = () => {
        setError('');
        setStep((s) => s - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await studentAPI.register({
                studentId:     formData.studentId,
                fullName:      formData.fullName,
                email:         formData.email,
                password:      formData.password,
                hallShortName: formData.hallShortName,
                roomNumber:    formData.roomNumber || null,
                department:    formData.department,
                gender:        formData.gender,
            });
            setSuccess('Registration successful! Redirecting to login…');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if      (err.response?.status === 409) setError('Email or Student ID already exists.');
            else if (err.response?.status === 400) setError(err.response.data?.message || 'Invalid registration data.');
            else                                   setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step content ─────────────────────────────────────────
    const renderStep = () => {
        if (step === 0) return (
            <>
                <div className="rp-section-label">Personal Information</div>

                <div className="rp-row">
                    <div className="rp-field">
                        <label htmlFor="rp-studentId">Student ID</label>
                        <input
                            id="rp-studentId"
                            type="text"
                            value={formData.studentId}
                            onChange={set('studentId')}
                            placeholder="CE21012"
                            maxLength="20"
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="rp-field">
                        <label htmlFor="rp-roomNumber">
                            Room No.{' '}
                            <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.68rem', color: '#a08080' }}>
                                (optional)
                            </span>
                        </label>
                        <input
                            id="rp-roomNumber"
                            type="text"
                            value={formData.roomNumber}
                            onChange={set('roomNumber')}
                            placeholder="112"
                            maxLength="15"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="rp-field">
                    <label htmlFor="rp-fullName">Full Name</label>
                    <input
                        id="rp-fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={set('fullName')}
                        placeholder="Alamgir Hosain"
                        maxLength="100"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="rp-field">
                    <label htmlFor="rp-email">Email Address</label>
                    <input
                        id="rp-email"
                        type="email"
                        value={formData.email}
                        onChange={set('email')}
                        placeholder="CE21012@mbstu.ac.bd"
                        disabled={loading}
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="rp-field">
                    <label>Gender</label>
                    <div className="rp-gender">
                        <label className="rp-radio">
                            <input
                                type="radio"
                                name="rp-gender"
                                value="MALE"
                                checked={formData.gender === 'MALE'}
                                onChange={set('gender')}
                                disabled={loading}
                            />
                            Male
                        </label>
                        <label className="rp-radio">
                            <input
                                type="radio"
                                name="rp-gender"
                                value="FEMALE"
                                checked={formData.gender === 'FEMALE'}
                                onChange={set('gender')}
                                disabled={loading}
                            />
                            Female
                        </label>
                    </div>
                </div>
            </>
        );

        if (step === 1) return (
            <>
                <div className="rp-section-label">Academic Details</div>

                <div className="rp-field">
                    <label htmlFor="rp-department">Department</label>
                    <select
                        id="rp-department"
                        value={formData.department}
                        onChange={set('department')}
                        disabled={loading}
                        required
                    >
                        <option value="">Select department</option>
                        {DEPT_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="rp-field">
                    <label htmlFor="rp-hall">Residential Hall</label>
                    <select
                        id="rp-hall"
                        value={formData.hallShortName}
                        onChange={set('hallShortName')}
                        disabled={loading}
                        required
                    >
                        <option value="">Select hall</option>
                        {HALL_OPTIONS.map((h) => (
                            <option key={h.shortName} value={h.shortName}>
                                {h.fullName} ({h.shortName})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rp-field rp-field--disabled">
                    <label htmlFor="rp-role">Role</label>
                    <input id="rp-role" type="text" value="STUDENT" disabled />
                    <small>Automatically assigned to all student registrations.</small>
                </div>
            </>
        );

        if (step === 2) return (
            <>
                <div className="rp-section-label">Set Password</div>

                <div className="rp-field">
                    <label htmlFor="rp-password">Password</label>
                    <input
                        id="rp-password"
                        type="password"
                        value={formData.password}
                        onChange={set('password')}
                        placeholder="Min. 6 characters"
                        minLength="6"
                        disabled={loading}
                        required
                        autoComplete="new-password"
                    />
                </div>

                <div className="rp-field">
                    <label htmlFor="rp-confirmPassword">Confirm Password</label>
                    <input
                        id="rp-confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={set('confirmPassword')}
                        placeholder="Re-enter password"
                        minLength="6"
                        disabled={loading}
                        required
                        autoComplete="new-password"
                    />
                </div>
            </>
        );
    };

    return (
        <div className="rp-page">
            <div className="rp-card">
                <div className="rp-inner">

                    {/* Branding */}
                    <div className="rp-badge">Registration — MBSTUian</div>
                    <h1 className="rp-title">Create Account</h1>
                    <p className="rp-subtitle">
                        Step {step + 1} of {STEPS.length} —{' '}
                        {['Personal details', 'Academic details', 'Set your password'][step]}
                    </p>

                    {/* Step indicator */}
                    <div className="rp-steps">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.label}
                                className={`rp-step${i === step ? ' rp-step--active' : ''}${i < step ? ' rp-step--done' : ''}`}
                            >
                                <div className="rp-step-bubble">
                                    {i < step ? <CheckIcon /> : i + 1}
                                </div>
                                <span className="rp-step-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="rp-divider" />

                    {error   && <div className="rp-error">{error}</div>}
                    {success && <div className="rp-success">{success}</div>}

                    {/* Step content */}
                    <form onSubmit={step < 2 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
                        {renderStep()}

                        <div className="rp-nav">
                            {step > 0 && (
                                <button
                                    type="button"
                                    className="rp-btn rp-btn--ghost"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                            )}
                            <button
                                type="submit"
                                className="rp-btn rp-btn--primary"
                                disabled={loading}
                            >
                                {step < 2
                                    ? <>Next →</>
                                    : loading
                                        ? 'Creating account…'
                                        : 'Create Account'
                                }
                            </button>
                        </div>
                    </form>

                    <div className="rp-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>

                </div>
            </div>
        </div>
    );
};
