import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { hallStaffAPI } from '../../../services/api';
import '../HallStaffPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export const HallStaffDashboard = () => {
    const { logout } = useAuth();
    const [counts, setCounts] = useState({
        meals: 0,
        payments: 0,
    });
    const [summaries, setSummaries] = useState([]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [mealsRes, paymentsRes] = await Promise.all([
                    hallStaffAPI.getMealConfigs(),
                    hallStaffAPI.getPayments({ page: 0, size: 1 }),
                ]);

                // fetch a small page of summaries for dashboard card
                let summariesRes = null;
                try {
                    summariesRes = await hallStaffAPI.getHallSummaries({ page: 0, size: 5 });
                } catch (err) {
                    console.warn('Failed to load hall summaries for dashboard', err);
                }

                const paymentPayload = paymentsRes.data;
                const paymentCount = typeof paymentPayload?.totalElements === 'number'
                    ? paymentPayload.totalElements
                    : getItems(paymentPayload).length;

                setCounts({
                    meals: getItems(mealsRes.data).length,
                    payments: paymentCount,
                });

                if (summariesRes) {
                    setSummaries(getItems(summariesRes.data));
                }
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
                    <h3>Pending Payments</h3>
                    <p className="stat-number">{counts.payments}</p>
                </div>

            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card" style={{ gridColumn: '2 / 3' }}>
                    <div className="card-icon">📊</div>
                    <h3>Hall Meal Summary</h3>
                    {summaries.length === 0 ? (
                        <p style={{ marginTop: '0.5rem' }}>No summaries available</p>
                    ) : (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {summaries.map((s) => (
                                <div key={s.id} className="summary-mini-card" style={{ border: '1px solid #eee', padding: '0.5rem', borderRadius: '6px', minWidth: '150px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.mealDate} · {s.mealType}</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        <div>Sold: <strong>{s.totalTokensSold ?? 0}</strong></div>
                                        <div>Used: <strong>{s.totalTokensUsed ?? 0}</strong></div>
                                        <div>Unused: <strong>{s.totalTokensUnused ?? 0}</strong></div>
                                        <div>Revenue: <strong>{s.totalRevenue ?? 0}</strong></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};



