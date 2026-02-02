// src/admin/AdminLayout.jsx
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Overview' },
    { path: '/admin/payments', label: 'Payments' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/tasks', label: 'Tasks' },
    { path: '/admin/withdrawals', label: 'Withdrawals' },
    { path: '/admin/task-submissions', label: 'Submissions' },
  ];

  async function handleAdminLogout() {
    try {
      await fetch('http://localhost:5000/api/admin-auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore
    }
    window.location.href = '/admin/login';
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">Growpreen Admin</div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={
                'admin-nav-item' +
                (location.pathname === item.path ? ' admin-nav-item-active' : '')
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Admin Panel</div>
          <div className="admin-topbar-right">
            <button
              className="admin-icon-button"
              title="Logout"
              onClick={handleAdminLogout}
            >
              ⏻
            </button>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}


async function handleAdminLogout() {
  try {
    await fetch('http://localhost:5000/api/admin-auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    // ignore
  }
  window.location.href = '/admin/login';
}
