import { Link, useLocation } from 'react-router-dom';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="gp-dashboard">
      <aside className="gp-d-sidebar">
        <div className="gp-d-logo">Growpreen</div>
        <nav className="gp-d-nav">
          <Link
            to="/dashboard"
            className={path === '/dashboard' ? 'active' : ''}
          >
            Overview
          </Link>
          <Link
            to="/dashboard/tasks"
            className={path.startsWith('/dashboard/tasks') ? 'active' : ''}
          >
            Tasks
          </Link>
          <Link
            to="/dashboard/referrals"
            className={path.startsWith('/dashboard/referrals') ? 'active' : ''}
          >
            Referrals
          </Link>
          <Link
            to="/dashboard/withdrawals"
            className={path.startsWith('/dashboard/withdrawals') ? 'active' : ''}
          >
            Withdraw
          </Link>
        </nav>
      </aside>

      <div className="gp-d-main">
        <header className="gp-d-header">
          <div className="gp-d-header-title">Dashboard</div>
          {/* you can add user name & logout button here later */}
        </header>

        <div className="gp-d-content">
          {children}
        </div>
      </div>
    </div>
  );
}
