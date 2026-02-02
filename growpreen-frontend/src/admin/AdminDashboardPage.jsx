// src/admin/AdminDashboardPage.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/summary');
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="gp-card">Loading summary...</div>;
  }

  if (!summary) {
    return <div className="gp-card">Failed to load summary.</div>;
  }

  return (
    <div className="admin-dashboard-grid gp-page gp-admin-page">
      <div className="gp-card gp-admin-card">
        <h3>Total users</h3>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary.totalUsers}</p>
      </div>
      <div className="gp-card">
        <h3>Total balance</h3>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{summary.totalUserBalance}</p>
      </div>
      <div className="gp-card">
        <h3>Pending payments</h3>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary.pendingPayments}</p>
      </div>
      <div className="gp-card">
        <h3>Pending withdrawals</h3>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary.pendingWithdrawals}</p>
      </div>
    </div>
  );
}
