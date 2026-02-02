import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const prefilledMobile = searchParams.get('mobile') || '';

  const [mobile, setMobile] = useState(prefilledMobile);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [qualification, setQualification] = useState('');

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // 🚫 Prevent double submit
    if (loading) return;

    setError('');
    setStatus('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        mobile,
        password,
        name,
        age,
        gender,
        qualification,
      });

      setStatus('success');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1>Create your Growpreen account</h1>
        <p className="gp-subtitle">
          Use the same mobile number you used for payment. We’ll verify your
          payment automatically.
        </p>

        <form className="gp-form" onSubmit={handleSubmit}>
          <label className="gp-field">
            <span>Mobile number</span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              readOnly={!!prefilledMobile}
              disabled={loading}
            />
          </label>

          <label className="gp-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="gp-field">
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="gp-field">
            <span>Age</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="gp-field">
            <span>Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="gp-field">
            <span>Qualification</span>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="gp-btn-primary"
            disabled={loading}
          >
            {loading ? <span className="gp-spinner" /> : 'Register'}
          </button>

          {error && (
            <p className="gp-alert gp-alert-error">{error}</p>
          )}

          {status === 'success' && (
            <p className="gp-alert gp-alert-success">
              Account created. Redirecting to login...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
