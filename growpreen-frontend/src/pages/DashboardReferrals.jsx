import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardReferrals() {
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [copyLoading, setCopyLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, refRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/referrals/summary'),
        ]);
        setUser(meRes.data);
        setSummary(refRes.data);
      } catch (err) {
        console.error('Failed to load referral data', err);
      }
    }
    load();
  }, []);

  if (!summary || !user) return <div>Loading...</div>;

  const refCode = user.myRefCode || '';
  const referralLink = refCode
    ? `${window.location.origin}/buy?ref=${refCode}`
    : `${window.location.origin}/buy`;

  const progress12 = Math.min(summary.count / 12, 1);
  const progress24 = Math.min(summary.count / 24, 1);

  const handleCopy = async () => {
    if (copyLoading || !referralLink) return;

    setCopyLoading(true);
    try {
      await navigator.clipboard.writeText(referralLink);
      setTimeout(() => setCopyLoading(false), 1200);
    } catch (err) {
      setCopyLoading(false);
    }
  };

  return (
    <div className="gp-page">
      <div className="gp-card">
        <h2>Refer & Earn</h2>
        <p className="gp-subtitle">
          Invite friends to join the Digital Marketing course and earn every month.
        </p>

        <section style={{ marginTop: '1.3rem' }}>
          <p className="gp-label">Your referral link</p>
          <div className="gp-ref-link-row">
            <input
              className="gp-ref-input"
              readOnly
              value={referralLink}
              onFocus={e => e.target.select()}
            />
            <button
              className="gp-btn-secondary"
              type="button"
              disabled={copyLoading || !refCode}
              onClick={handleCopy}
            >
              {copyLoading ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {!refCode && (
            <p className="gp-note">
              Your referral code is not available yet. It will appear after your registration is completed.
            </p>
          )}
        </section>

        <section className="gp-overview-grid" style={{ marginTop: '1.4rem' }}>
          <div className="gp-overview-card">
            <p className="gp-label">Referrals this month</p>
            <p className="gp-value">{summary.count}</p>
          </div>

          <div className="gp-overview-card">
            <p className="gp-label">Referral income (₹30 each)</p>
            <p className="gp-value">₹{summary.referralEarning}</p>
          </div>

          <div className="gp-overview-card">
            <p className="gp-label">Monthly salary</p>
            <p className="gp-value">₹{summary.salary}</p>
          </div>

          <div className="gp-overview-card">
            <p className="gp-label">Total monthly from referrals</p>
            <p className="gp-value">₹{summary.totalMonthlyReferralIncome}</p>
          </div>
        </section>

        <section style={{ marginTop: '1.8rem' }}>
          <h3 style={{ marginBottom: '0.6rem' }}>Targets</h3>

          <div className="gp-target">
            <div className="gp-target-header">
              <span>Complete 12 referrals</span>
              <span>{summary.count} / 12</span>
            </div>
            <div className="gp-progress">
              <div
                className="gp-progress-bar"
                style={{ width: `${progress12 * 100}%` }}
              />
            </div>
            <p className="gp-target-text">
              Earn ₹30 × 12 + ₹1100 salary = ₹1460 for this month when you hit 12 referrals.
            </p>
          </div>

          <div className="gp-target">
            <div className="gp-target-header">
              <span>Reach 24 referrals</span>
              <span>{summary.count} / 24</span>
            </div>
            <div className="gp-progress">
              <div
                className="gp-progress-bar gp-progress-bar-blue"
                style={{ width: `${progress24 * 100}%` }}
              />
            </div>
            <p className="gp-target-text">
              Salary doubles to ₹2200 when you reach 24 referrals in a month.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
