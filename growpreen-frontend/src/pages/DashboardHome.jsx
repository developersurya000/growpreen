// src/pages/DashboardHome.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardTasks from './DashboardTasks';

export default function DashboardHome() {
  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, balRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/withdrawals/balance'),
        ]);

        if (!cancelled) {
          setMe(meRes.data);
          setBalance(balRes.data.balance || 0);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setMe(null);
          setBalance(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !me) {
    return (
      <div className="gp-page">
        <div className="gp-card">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="gp-page">
      {/* top greeting */}
      <div className="gp-card" style={{ marginBottom: '1rem' }}>
        <h2>Welcome, {me.name || me.mobile}</h2>
        <p className="gp-subtitle">
          Track your earnings, complete tasks and withdraw once your balance reaches ₹200.
        </p>
      </div>

      {/* top row: analytics + balance */}
      <div className="gp-dashboard-top" style={{ marginBottom: '1.5rem' }}>
        {/* analytics middle section */}
        <div className="gp-card" style={{ flex: '1 1 auto' }}>
          <h3>Your performance</h3>
          <div
            className="gp-analytics-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.75rem',
              marginTop: '0.75rem',
            }}
          >
            <div className="gp-analytics-item">
              <div className="gp-label">Today</div>
              <div className="gp-analytics-value">₹{me.dailyEarning}</div>
            </div>
            <div className="gp-analytics-item">
              <div className="gp-label">This month</div>
              <div className="gp-analytics-value">₹{me.monthlyEarning}</div>
            </div>
            <div className="gp-analytics-item">
              <div className="gp-label">Total</div>
              <div className="gp-analytics-value">₹{me.totalEarning}</div>
            </div>
            <div className="gp-analytics-item">
              <div className="gp-label">Referrals</div>
              <div className="gp-analytics-value">{me.referralsCompleted}</div>
            </div>
          </div>
          {/* You can later add a small chart below these numbers */}
        </div>

        {/* balance on top right */}
        <div className="gp-card" style={{ flex: '0 0 260px' }}>
          <h3>Balance</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{balance}</div>
          <p className="gp-subtitle" style={{ marginTop: '0.5rem' }}>
            Withdrawable once balance ≥ ₹200.
          </p>
        </div>
      </div>

      {/* tasks section directly in homepage */}
      <div className="gp-card" style={{ marginBottom: '1.5rem' }}>
        <h3>Available tasks</h3>
        <p className="gp-subtitle">
          Complete these tasks, submit proof and get earnings added to your balance.
        </p>
        <DashboardTasks embedded />
      </div>

      {/* footer / common section */}
      <footer className="gp-home-footer">
        <hr />
        <p>Contact: support@growpreen.com</p>
        <p>© {new Date().getFullYear()} Growpreen. All rights reserved. Terms &amp; Conditions apply.</p>
      </footer>
    </div>
  );
}
