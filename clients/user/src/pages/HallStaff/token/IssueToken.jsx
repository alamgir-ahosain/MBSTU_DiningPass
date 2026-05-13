import { Link } from 'react-router-dom';
import '../HallStaffPages.css';

export const IssueToken = () => {
    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Issue Dining Token</h1>

                <form style={{ marginTop: '2rem' }}>
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID</label>
                        <input
                            id="studentId"
                            type="text"
                            placeholder="Enter student ID"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tokenType">Token Type</label>
                        <select id="tokenType">
                            <option value="">Select token type</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                        </select>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">
                            Issue Token
                        </button>
                        <button type="button" onClick={() => window.history.back()} className="btn btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

