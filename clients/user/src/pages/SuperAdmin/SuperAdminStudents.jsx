import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI, studentAPI } from '../../services/api';
import './SuperAdminPages.css';

export const SuperAdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        hallId: '',
        department: '',
    });

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await superAdminAPI.getAllStudents(filters);
                console.log('Students response:', response);
                setStudents(response.data || []);
            } catch (err) {
                console.error('Fetch students error:', err);
                setError('Failed to load students. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [filters]);

    const handleSuspend = async (studentId) => {
        if (window.confirm('Are you sure you want to suspend this student?')) {
            try {
                await superAdminAPI.suspendStudent(studentId);
                setStudents(students.map(s => s.id === studentId ? { ...s, isActive: false } : s));
            } catch (err) {
                alert('Failed to suspend student: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="page-wrapper">
            <Link to="/superAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">All Students</h1>

                {error && <div className="message error">{error}</div>}

                <div className="filters-section" style={{ marginBottom: '1.5rem' }}>
                    <h3>Filters</h3>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="hallId">Hall ID</label>
                            <input
                                id="hallId"
                                type="text"
                                name="hallId"
                                value={filters.hallId}
                                onChange={handleFilterChange}
                                placeholder="Filter by hall ID"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="department">Department</label>
                            <select
                                id="department"
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Departments</option>
                                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                <option value="Information and Communication Technology">Information and Communication Technology</option>
                                <option value="Criminology and Police Science">Criminology and Police Science</option>
                                <option value="Textile Engineering">Textile Engineering</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <p>Loading students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <h3>No students found</h3>
                        <p>Students will appear here as they register</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Student ID</th>
                                    <th>Email</th>
                                    <th>Hall</th>
                                    <th>Department</th>
                                    <th>Gender</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.fullName}</td>
                                        <td><strong>{student.studentId}</strong></td>
                                        <td>{student.email}</td>
                                        <td>{student.hallShortName || student.hallId}</td>
                                        <td>{student.department}</td>
                                        <td>{student.gender}</td>
                                        <td>
                                            <span className={`badge ${student.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {student.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/superAdmin/students/${student.id}`} className="btn-small btn-view">View</Link>
                                                {student.isActive && (
                                                    <button
                                                        className="btn-small btn-suspend"
                                                        onClick={() => handleSuspend(student.id)}
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
