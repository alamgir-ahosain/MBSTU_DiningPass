import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { hallAdminAPI } from '../../../services/api';
import '../HallAdminPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export const HallAdminDashboard = () => {
    const [counts, setCounts] = useState({
        students: 0,
        staff: 0,
        meals: 0,
        payments: 0,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [studentsRes, staffRes, mealsRes, paymentsRes] = await Promise.all([
                    hallAdminAPI.getStudents(),
                    hallAdminAPI.getHallStaff({ role: 'HALL_STAFF' }),
                    hallAdminAPI.getMealConfigs(),
                    hallAdminAPI.getPayments({ page: 0, size: 1 }),
                ]);

                const paymentPayload = paymentsRes.data;
                const paymentCount = typeof paymentPayload?.totalElements === 'number'
                    ? paymentPayload.totalElements
                    : getItems(paymentPayload).length;

                setCounts({
                    students: getItems(studentsRes.data).length,
                    staff: getItems(staffRes.data).length,
                    meals: getItems(mealsRes.data).length,
                    payments: paymentCount,
                });
            } catch (error) {
                console.warn('Failed to load Hall Admin dashboard counts', error);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hall Admin Dashboard</h1>
                <p>Manage students, hall staff, meals, and payments from one place.</p>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Students</h3>
                    <p className="stat-number">{counts.students}</p>
                </div>
                <div className="stat-card">
                    <h3>Hall Staff</h3>
                    <p className="stat-number">{counts.staff}</p>
                </div>
                <div className="stat-card">
                    <h3>Meal Configs</h3>
                    <p className="stat-number">{counts.meals}</p>
                </div>
                <div className="stat-card">
                    <h3>Payments</h3>
                    <p className="stat-number">{counts.payments}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <Link to="/hallAdmin/students" className="dashboard-card">
                    <div className="card-icon">🎓</div>
                    <h3>Manage Students</h3>
                    <p>Get all students and suspend or activate accounts.</p>
                </Link>

                <Link to="/hallAdmin/staff" className="dashboard-card">
                    <div className="card-icon">👥</div>
                    <h3>Manage Hall Staff</h3>
                    <p>Create hall staff accounts and manage status.</p>
                </Link>

                <Link to="/hallAdmin/meals" className="dashboard-card">
                    <div className="card-icon">🍴</div>
                    <h3>Meal Config</h3>
                    <p>Create, view, and update meal configurations.</p>
                </Link>

                <Link to="/hallAdmin/payments" className="dashboard-card">
                    <div className="card-icon">💳</div>
                    <h3>Payments</h3>
                    <p>View all submitted payments for your hall.</p>
                </Link>

                <Link to="/hallAdmin/profile" className="dashboard-card info-card">
                    <div className="card-icon">👤</div>
                    <h3>My Profile</h3>
                    <p>View profile, update info, and manage password options.</p>
                </Link>
            </div>
        </div>
    );
};

