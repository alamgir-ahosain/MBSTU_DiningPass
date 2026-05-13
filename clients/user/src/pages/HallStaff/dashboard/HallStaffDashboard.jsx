import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallStaffAPI } from '../../../services/api';
import '../HallStaffPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export const HallStaffDashboard = () => {
    const [counts, setCounts] = useState({
        meals: 0,
        payments: 0,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [mealsRes, paymentsRes] = await Promise.all([
                    hallStaffAPI.getMealConfigs(),
                    hallStaffAPI.getPayments({ page: 0, size: 1 }),
                ]);

                const paymentPayload = paymentsRes.data;
                const paymentCount = typeof paymentPayload?.totalElements === 'number'
                    ? paymentPayload.totalElements
                    : getItems(paymentPayload).length;

                setCounts({
                    meals: getItems(mealsRes.data).length,
                    payments: paymentCount,
                });
            } catch (error) {
                console.warn('Failed to load Hall Staff dashboard counts', error);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hall Staff Dashboard</h1>
                <p>Review payments, manage meal configs, and support student dining operations.</p>
            </div>

            <div className="admin-stats">
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
                <Link to="/hallStaff/payments" className="dashboard-card">
                    <div className="card-icon">💳</div>
                    <h3>Payments</h3>
                    <p>View submitted payments and approve them with screenshot preview.</p>
                </Link>

                <Link to="/hallStaff/meals" className="dashboard-card">
                    <div className="card-icon">🍴</div>
                    <h3>Meals</h3>
                    <p>Manage meal configs just like hall admin.</p>
                </Link>

                <Link to="/hallStaff/profile" className="dashboard-card info-card">
                    <div className="card-icon">👤</div>
                    <h3>My Profile</h3>
                    <p>View and update your hall staff profile.</p>
                </Link>
            </div>
        </div>
    );
};



