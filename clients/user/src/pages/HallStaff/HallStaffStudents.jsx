import { Link } from 'react-router-dom';
import './HallStaffPages.css';

export const HallStaffStudents = () => {
    const students = [];

    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Students in Your Hall</h1>

                {students.length === 0 ? (
                    <div className="empty-state">
                        <h3>No students found</h3>
                        <p>Students will appear here once they register</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{`${student.firstName} ${student.lastName}`}</td>
                                        <td>{student.studentId}</td>
                                        <td>{student.status}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-small btn-view">View</button>
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
