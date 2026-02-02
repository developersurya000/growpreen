// src/components/PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

export default function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        await api.get('/auth/me');   // will use cookie
        if (mounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch {
        if (mounted) {
          setAuthorized(false);
          setChecking(false);
        }
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
