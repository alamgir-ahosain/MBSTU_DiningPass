import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { superAdminAPI } from '../../services/api';
import './SuperAdminPages.css';

const getCountValue = (payload) => {
    if (typeof payload === 'number') return payload;
    if (typeof payload?.count === 'number') return payload.count;
    return 0;
};

const getAdminCountValue = (payload) => {
    if (typeof payload === 'number') return payload;
    if (typeof payload?.active_hall_admins === 'number') return payload.active_hall_admins;
    if (typeof payload?.count === 'number') return payload.count;
    return 0;
};

export const SuperAdminDashboard = () => {
    const { userData } = useAuth();
    const [hallsCount, setHallsCount] = useState(0);
    const [adminsCount, setAdminsCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [hRes, aRes] = await Promise.all([
                    superAdminAPI.getCount(),
                    superAdminAPI.getAdminsCount(),
                ]);
                setHallsCount(getCountValue(hRes.data));
                setAdminsCount(getAdminCountValue(aRes.data));
            } catch (e) {
                console.warn('Failed to fetch dashboard counts', e);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                {/*<p>Welcome, {userData?.firstName || 'Super Admin'}!</p>*/}
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Active Halls</h3>
                    <p className="stat-number">{hallsCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Active Hall Admins</h3>
                    <p className="stat-number">{adminsCount}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Link to="/superAdmin/halls" className="dashboard-card">
                    <div className="card-icon">🏢</div>
                    <h3>Manage Halls</h3>
                    <p>View and manage all halls</p>
                </Link>

                <Link to="/superAdmin/admins" className="dashboard-card">
                    <div className="card-icon">👥</div>
                    <h3>Manage Hall Admins</h3>
                    <p>View and manage hall administrators</p>
                </Link>
            </div>

            {/*<div className="dashboard-section">*/}
            {/*    <h2>Quick Info</h2>*/}
            {/*    <div className="info-box">*/}
            {/*        <p><strong>Email:</strong> {userData?.email}</p>*/}
            {/*        <p><strong>Name:</strong> {userData?.firstName} {userData?.fullName}</p>*/}
            {/*        <p><strong>Role:</strong> {userData?.firstName} {userData?.Role}</p>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};
