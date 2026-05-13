import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallAdminAPI } from '../../../services/api';
import '../HallAdminPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export const HallAdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStudents = async (targetPage = 0) => {
        setLoading(true);
        setError('');
        try {
            const response = await hallAdminAPI.getStudents({ page: targetPage, size: 20 });
            const payload = response.data;
            setStudents(getItems(payload));
            setPage(typeof payload?.number === 'number' ? payload.number : targetPage);
            setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 1);
        } catch (err) {
            console.error('Failed to load students', err);
            setError('Failed to load students. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents(page);
    }, [page]);


    const handleToggleStatus = async (student) => {
        const nextActive = !student.isActive;
        const actionText = nextActive ? 'activate' : 'suspend';

        if (window.confirm(`Are you sure you want to ${actionText} this student?`)) {
            try {
                await hallAdminAPI.suspendStudent(student.id);
                await loadStudents(page);
            } catch (err) {
                console.error(`Failed to ${actionText} student`, err);
                setError(`Failed to ${actionText} student. ` + (err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Students</h1>
                <p className="detail-subtitle">Get all students from your hall and manage account status.</p>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state"><p>Loading students...</p></div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <h3>No students found</h3>
                        <p>Students will appear here after registration.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Room</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id || student.studentId}>
                                        <td>{student.studentId || '-'}</td>
                                        <td>{student.fullName || '-'}</td>
                                        <td>{student.email || '-'}</td>
                                        <td>{student.roomNumber || '-'}</td>
                                        <td>{student.department || '-'}</td>
                                        <td>
                                            <span className={`badge ${student.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                {student.isActive ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`btn-small ${student.isActive ? 'btn-suspend' : 'btn-activate'}`}
                                                onClick={() => handleToggleStatus(student)}
                                            >
                                                {student.isActive ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && students.length > 0 && (
                    <div className="button-group" style={{ justifyContent: 'space-between', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </button>
                        <span className="text-muted">Page {page + 1} of {Math.max(1, totalPages)}</span>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                            disabled={page + 1 >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

