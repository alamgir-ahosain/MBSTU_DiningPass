import { useEffect, useState } from 'react';
import { hallStaffAPI } from '../../../services/api';
import '../HallStaffPages.css';

export const HallMealSummary = () => {
  const [summaries, setSummaries] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hallStaffAPI.getHallSummaries({ page, size });
      setSummaries(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load hall summaries', err);
      setError('Failed to load hall summaries. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Hall Meal Summary</h1>

      {loading ? (
        <div className="empty-state"><p>Loading summaries...</p></div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : summaries.length === 0 ? (
        <div className="empty-state"><p>No summaries found.</p></div>
      ) : (
        <div className="card">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal</th>
                <th>Menu</th>
                <th>Price</th>
                <th>Sold</th>
                <th>Used</th>
                <th>Unused</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.id}>
                  <td>{s.mealDate}</td>
                  <td>{s.mealType}</td>
                  <td>{s.mealMenu || '-'}</td>
                  <td>{s.mealPrice ?? '-'}</td>
                  <td>{s.totalTokensSold ?? 0}</td>
                  <td>{s.totalTokensUsed ?? 0}</td>
                  <td>{s.totalTokensUnused ?? 0}</td>
                  <td>{s.totalRevenue ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
            <span style={{ margin: '0 1rem' }}>Page {page + 1}</span>
            <button className="btn" onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallMealSummary;

