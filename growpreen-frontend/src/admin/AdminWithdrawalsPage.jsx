import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(currentStatus = status) {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/withdrawals?status=${currentStatus}`);
      setItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStatusChange(e) {
    const s = e.target.value;
    setStatus(s);
    load(s);
  }

  async function approve(id) {
    try {
      await api.post(`/admin/withdrawals/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve withdrawal');
    }
  }

  async function reject(id) {
    try {
      await api.post(`/admin/withdrawals/${id}/reject`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject withdrawal');
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card gp-admin-inner">
        <h2 className="gp-admin-heading">Withdrawals</h2>
        <p className="gp-subtitle">
          Review user withdrawal requests and mark them as paid.
        </p>

        {error && (
          <p className="gp-alert gp-alert-error" style={{ marginTop: '0.75rem' }}>
            {error}
          </p>
        )}

        <div
          style={{
            marginTop: '0.8rem',
            marginBottom: '0.8rem',
          }}
        >
          <label className="gp-field" style={{ maxWidth: 220 }}>
            <span>Filter by status</span>
            <select value={status} onChange={handleStatusChange}>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="gp-table-wrapper gp-admin-table-wrapper">
            {items.length === 0 ? (
              <p>No withdrawals for this status.</p>
            ) : (
              <table className="gp-table gp-admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Details</th>
                    <th>Requested</th>
                    <th>Processed</th>
                    <th>Actions / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(w => (
                    <tr key={w.id}>
                      <td>{w.userId}</td>
                      <td>₹{w.amount}</td>
                      <td>{w.method}</td>
                      <td style={{ maxWidth: 200, fontSize: '0.8rem' }}>
                        {w.details}
                      </td>
                      <td>{w.createdAt || '-'}</td>
                      <td>{w.processedAt || '-'}</td>
                      <td>
                        {status === 'Pending' ? (
                          <div className="gp-table-actions">
                            <button
                              className="gp-btn-primary"
                              onClick={() => approve(w.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="gp-btn-secondary"
                              onClick={() => reject(w.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span>{w.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
