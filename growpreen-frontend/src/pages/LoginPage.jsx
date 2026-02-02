import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // prevent double submit

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/login', { mobile, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1>Login to Growpreen</h1>
        <p className="gp-subtitle">
          Enter your registered mobile and password.
        </p>

        <form className="gp-form" onSubmit={handleSubmit}>
          <label className="gp-field">
            <span>Mobile</span>
            <input
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="gp-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="gp-btn-primary"
            disabled={loading}
          >
            {loading ? <span className="gp-spinner" /> : 'Login'}
          </button>

          {error && (
            <p className="gp-alert gp-alert-error">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
