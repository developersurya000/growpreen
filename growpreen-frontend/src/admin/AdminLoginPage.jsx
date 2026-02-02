import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // backend expects: { mobile, password }
      await api.post('/admin-auth/login', {
        mobile: username,
        password,
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1>Admin login</h1>
        <p className="gp-subtitle">Restricted access for Growpreen admins.</p>

        <form className="gp-form" onSubmit={handleSubmit}>
          <label className="gp-field">
            <span>Username</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="gp-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="gp-btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="gp-spinner" /> : 'Login'}
          </button>

          {error && <p className="gp-alert gp-alert-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
