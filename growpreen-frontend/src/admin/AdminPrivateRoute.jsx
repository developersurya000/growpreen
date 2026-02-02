import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminPrivateRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        await api.get('/admin-auth/me');
        if (mounted) {
          setOk(true);
          setChecking(false);
        }
      } catch {
        if (mounted) {
          setOk(false);
          setChecking(false);
        }
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return <div style={{ padding: '2rem' }}>Checking admin login...</div>;
  }

  if (!ok) return <Navigate to="/admin/login" replace />;

  return children;
}
