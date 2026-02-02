import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatus(id, status) {
    if (actionLoadingId) return;

    setActionLoadingId(id);
    try {
      await api.post(`/admin/payments/${id}/status`, { status });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="gp-card">
      <h2>Payment management</h2>
      <p className="gp-subtitle">Approve or reject user payments with one click.</p>

      {loading && <p>Loading payments...</p>}

      {!loading && (
        <div className="gp-table-wrapper">
          <table className="gp-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Status</th>
                <th>RefCode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{p.name || '-'}</td>
                  <td>{p.mobile || '-'}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.status}</td>
                  <td>{p.refCode || '-'}</td>
                  <td>
                    {p.status === 'Pending' && (
                      <>
                        <button
                          className="gp-btn-primary"
                          disabled={actionLoadingId === p.id}
                          onClick={() => handleStatus(p.id, 'Approved')}
                        >
                          {actionLoadingId === p.id ? (
                            <span className="admin-spinner" />
                          ) : (
                            'Approve'
                          )}
                        </button>
                        <button
                          className="gp-btn-secondary"
                          disabled={actionLoadingId === p.id}
                          onClick={() => handleStatus(p.id, 'Rejected')}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {p.status === 'Approved' && (
                      <button
                        className="gp-btn-secondary"
                        disabled={actionLoadingId === p.id}
                        onClick={() => handleStatus(p.id, 'Rejected')}
                      >
                        {actionLoadingId === p.id ? (
                          <span className="admin-spinner" />
                        ) : (
                          'Mark Rejected'
                        )}
                      </button>
                    )}

                    {p.status === 'Rejected' && (
                      <button
                        className="gp-btn-primary"
                        disabled={actionLoadingId === p.id}
                        onClick={() => handleStatus(p.id, 'Approved')}
                      >
                        {actionLoadingId === p.id ? (
                          <span className="admin-spinner" />
                        ) : (
                          'Mark Approved'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6}>No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
