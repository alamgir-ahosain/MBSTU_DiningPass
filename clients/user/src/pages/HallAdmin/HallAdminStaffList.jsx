import { Link } from 'react-router-dom';
import './AdminPages.css';

export const HallAdminStaffList = () => {
    const staffList = []; // Will be populated from API

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Hall Staff Members</h1>
                    <Link to="/hallAdmin/create-staff" className="btn btn-primary">
                        ➕ Add New Staff
                    </Link>
                </div>

                {staffList.length === 0 ? (
                    <div className="empty-state">
                        <h3>No staff members yet</h3>
                        <p>Create your first hall staff member to get started</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td>{`${staff.firstName} ${staff.lastName}`}</td>
                                        <td>{staff.email}</td>
                                        <td>{staff.status}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-small btn-view">View</button>
                                                <button className="btn-small btn-suspend">Suspend</button>
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
