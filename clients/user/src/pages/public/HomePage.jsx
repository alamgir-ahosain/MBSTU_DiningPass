import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PublicPages.css';

export const HomePage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="page-container">
            <div className="home-content">
                <h1>Welcome to MBSTU Dining Pass</h1>
                <p>A comprehensive dining pass management system for MBSTU</p>

                {!isAuthenticated ? (
                    <div className="home-buttons">
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-secondary">
                            Register as Student
                        </Link>
                    </div>
                ) : (
                    <div className="home-buttons">
                        <Link to="/dashboard" className="btn btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                <div className="features">
                    <h2>Features</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>Student Portal</h3>
                            <p>Manage your dining pass, view profile, and update settings</p>
                        </div>
                        <div className="feature-card">
                            <h3>Hall Staff Management</h3>
                            <p>Track dining passes and manage student dining records</p>
                        </div>
                        <div className="feature-card">
                            <h3>Hall Admin Dashboard</h3>
                            <p>Create and manage hall staff, view hall statistics</p>
                        </div>
                        <div className="feature-card">
                            <h3>Super Admin Control</h3>
                            <p>System-wide administration and hall management</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
