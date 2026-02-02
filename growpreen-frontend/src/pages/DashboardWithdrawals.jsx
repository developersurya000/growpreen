import { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardWithdrawals() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const [payout, setPayout] = useState(null);
  const [payoutSaving, setPayoutSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [balRes, histRes, payoutRes] = await Promise.all([
        api.get('/withdrawals/balance'),
        api.get('/withdrawals/my'),
        api.get('/profile/payout'),
      ]);
      setBalance(balRes.data.balance);
      setHistory(histRes.data);
      setPayout(payoutRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleWithdraw(e) {
    e.preventDefault();
    if (sending) return; // prevent double submit

    setStatusMsg('');
    setError('');

    if (!payout?.method) {
      setError('Please save your UPI / bank details first.');
      return;
    }

    setSending(true);
    try {
      await api.post('/withdrawals/request', { amount: Number(amount) });
      setStatusMsg('Withdrawal request submitted. We will process soon.');
      setAmount('');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setSending(false);
    }
  }

  async function savePayout(data) {
    if (payoutSaving) return; // prevent double submit

    setPayoutSaving(true);
    try {
      await api.post('/profile/payout', data);
      const res = await api.get('/profile/payout');
      setPayout(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setPayoutSaving(false);
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card">
        <h2>Withdraw earnings</h2>
        <p className="gp-subtitle">Available balance: ₹{balance}</p>

        {loading ? (
          <div style={{ marginTop: '1rem' }}>
            <span className="gp-spinner" /> Loading...
          </div>
        ) : (
          <>
            <div
              className="gp-home-two-cols"
              style={{ marginTop: '1.2rem', marginBottom: '1.4rem' }}
            >
              <div className="gp-home-box">
                <h3>Saved payout details</h3>
                {payout?.method ? (
                  <p className="gp-target-text">
                    Current method: {payout.method === 'UPI' ? 'UPI' : 'Bank'}. You
                    can update these details anytime.
                  </p>
                ) : (
                  <p className="gp-target-text">
                    You have not added your bank / UPI details yet.
                  </p>
                )}
              </div>

              <div className="gp-home-box">
                {payout && (
                  <PayoutForm
                    payout={payout}
                    saving={payoutSaving}
                    onSave={savePayout}
                  />
                )}
              </div>
            </div>

            <form className="gp-form" onSubmit={handleWithdraw}>
              <h3>Request withdrawal</h3>

              <label className="gp-field">
                <span>Amount (minimum ₹200)</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={200}
                  required
                  disabled={sending}
                />
              </label>

              <button
                type="submit"
                className="gp-btn-primary"
                disabled={sending}
              >
                {sending ? <span className="gp-spinner" /> : 'Request withdrawal'}
              </button>

              {statusMsg && (
                <p className="gp-alert gp-alert-success">{statusMsg}</p>
              )}
              {error && <p className="gp-alert gp-alert-error">{error}</p>}
            </form>

            {history.length > 0 && (
              <div style={{ marginTop: '1.6rem' }}>
                <h3>Recent withdrawal requests</h3>
                <div className="gp-table-wrapper">
                  <table className="gp-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(w => (
                        <tr key={w.id}>
                          <td>{w.createdAt || '-'}</td>
                          <td>₹{w.amount}</td>
                          <td>{w.method}</td>
                          <td>{w.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PayoutForm({ payout, saving, onSave }) {
  const [method, setMethod] = useState(payout.method || 'UPI');
  const [upiName, setUpiName] = useState(payout.upiName || '');
  const [upiMobile, setUpiMobile] = useState(payout.upiMobile || '');
  const [upiId, setUpiId] = useState(payout.upiId || '');
  const [bankName, setBankName] = useState(payout.bankName || '');
  const [accountNumber, setAccountNumber] = useState(
    payout.accountNumber || ''
  );
  const [ifsc, setIfsc] = useState(payout.ifsc || '');
  const [accountHolder, setAccountHolder] = useState(
    payout.accountHolder || ''
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (saving) return; // prevent double submit

    onSave({
      method,
      upiName,
      upiMobile,
      upiId,
      bankName,
      accountNumber,
      ifsc,
      accountHolder,
    });
  }

  return (
    <form className="gp-form" onSubmit={handleSubmit}>
      <label className="gp-field">
        <span>Preferred method</span>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          disabled={saving}
        >
          <option value="UPI">UPI</option>
          <option value="Bank">Bank</option>
        </select>
      </label>

      {method === 'UPI' ? (
        <>
          <label className="gp-field">
            <span>Name</span>
            <input
              value={upiName}
              onChange={e => setUpiName(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="gp-field">
            <span>Mobile</span>
            <input
              value={upiMobile}
              onChange={e => setUpiMobile(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="gp-field">
            <span>UPI ID</span>
            <input
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              required
              disabled={saving}
            />
          </label>
        </>
      ) : (
        <>
          <label className="gp-field">
            <span>Account holder name</span>
            <input
              value={accountHolder}
              onChange={e => setAccountHolder(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="gp-field">
            <span>Bank name</span>
            <input
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="gp-field">
            <span>Account number</span>
            <input
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
              disabled={saving}
            />
          </label>
          <label className="gp-field">
            <span>IFSC code</span>
            <input
              value={ifsc}
              onChange={e => setIfsc(e.target.value)}
              required
              disabled={saving}
            />
          </label>
        </>
      )}

      <button
        className="gp-btn-secondary"
        type="submit"
        disabled={saving}
      >
        {saving ? <span className="gp-spinner" /> : 'Save payout details'}
      </button>
    </form>
  );
}
