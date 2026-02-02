// src/pages/BuyCoursePage.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import qrImage from '../assets/qr.png';

export default function BuyCoursePage() {
  const location = useLocation();

  const [mobile, setMobile] = useState('');
  const [amount] = useState(200); // offer price
  const [utr, setUtr] = useState('');
  const [status, setStatus] = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false); // ✅ added

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || '';
    setRefCode(ref);
  }, [location.search]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return; // 🚫 prevent double submit

    setStatus('');
    setLoading(true); // ✅ start loading

    try {
      await api.post('/payments/create', {
        mobile,
        amount,
        utr,
        refCode,
      });

      setStatus('success');
      setMobile('');
      setUtr('');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false); // ✅ stop loading
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card gp-buy-card">
        <div className="gp-buy-header">
          <h1>Digital Marketing Course</h1>
          <p className="gp-subtitle">
            Learn digital marketing and start earning with Growpreen.
          </p>
          <p className="gp-price">
            <span className="gp-price-offer">₹{amount}</span>
            <span className="gp-price-original">₹300</span>
            <span className="gp-price-tag">7-day offer</span>
          </p>
        </div>

        <div className="gp-buy-body">
          <div className="gp-buy-left">
            <h3>Step 1: Scan & Pay</h3>
            <div className="gp-qr-wrapper">
              <img src={qrImage} alt="UPI QR" className="gp-qr" />
            </div>
            <p className="gp-note">
              Use any UPI app (PhonePe, GPay, Paytm) to pay the offer amount.
            </p>
            <ul className="gp-list">
              <li>Do not close the app until payment is complete.</li>
              <li>Copy the UTR / transaction ID from your UPI app.</li>
            </ul>
          </div>

          <div className="gp-buy-right">
            <h3>Step 2: Submit payment details</h3>
            <form className="gp-form" onSubmit={handleSubmit}>
              <label className="gp-field">
                <span>Mobile number</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="Enter WhatsApp number"
                  required
                  disabled={loading} // ✅ optional safety
                />
              </label>

              <label className="gp-field">
                <span>Amount (₹)</span>
                <input type="number" value={amount} readOnly />
              </label>

              <label className="gp-field">
                <span>UTR / Transaction ID</span>
                <input
                  type="text"
                  value={utr}
                  onChange={e => setUtr(e.target.value)}
                  placeholder="Example: 3129XXXXXXXX"
                  required
                  disabled={loading} // ✅ optional safety
                />
              </label>

              {refCode && (
                <p className="gp-note">
                  Referral code applied: <strong>{refCode}</strong>
                </p>
              )}

              <button
                type="submit"
                className="gp-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="gp-spinner"
                      style={{ marginRight: 8 }}
                    />
                    Submitting…
                  </>
                ) : (
                  'Submit payment'
                )}
              </button>

              {status === 'success' && (
                <p className="gp-alert gp-alert-success">
                  Payment request submitted. We will verify within 4–8 hours and
                  send your registration link on WhatsApp.
                </p>
              )}
              {status === 'error' && (
                <p className="gp-alert gp-alert-error">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
