// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import BuyCoursePage from './pages/BuyCoursePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardTasks from './pages/DashboardTasks';
import DashboardHome from './pages/DashboardHome';
import DashboardReferrals from './pages/DashboardReferrals';
import PrivateRoute from './components/PrivateRoute';
import TaskSubmitPage from './pages/TaskSubmitPage';
import AdminLayout from './admin/AdminLayout';
import AdminTasksPage from './admin/AdminTasksPage';
import AdminTaskSubmissionsPage from './admin/AdminTaskSubmissionsPage';
import AdminLoginPage from './admin/AdminLoginPage';
import AdminPrivateRoute from './admin/AdminPrivateRoute';
import DashboardWithdrawals from './pages/DashboardWithdrawals';
import AdminWithdrawalsPage from './admin/AdminWithdrawalsPage';
import NotificationsBell from './components/NotificationsBell';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminPaymentsPage from './admin/AdminPaymentsPage';
import AdminUsersPage from './admin/AdminUsersPage';
import api from './services/api';
import './App.css';

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // check user auth from cookie
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await api.get('/auth/me');
        if (!cancelled && res.status === 200) setIsUserLoggedIn(true);
      } catch {
        if (!cancelled) setIsUserLoggedIn(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // if logged in, redirect from public pages to dashboard
  useEffect(() => {
    if (
      isUserLoggedIn &&
      (location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/register')
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, [isUserLoggedIn, location.pathname, navigate]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="gp-app">
      {/* hide public header on admin urls */}
      {!isAdminRoute && (
        <header className="gp-header">
          <div className="gp-header-inner">
            <div className="gp-logo">Growpreen</div>

            {!isUserLoggedIn && (
              <nav className="gp-nav">
                <Link to="/">Home</Link>
                <Link to="/buy">Buy Course</Link>
                <Link to="/login">Login</Link>
              </nav>
            )}

            {isUserLoggedIn && (
              <nav className="gp-nav">
                <Link to="/dashboard">Dashboard</Link>
              </nav>
            )}

            <div className="gp-header-right">
              <NotificationsBell />

              {isUserLoggedIn && (
                <button
                  className="gp-icon-button"
                  title="Logout"
                  onClick={async () => {
                    try {
                      await api.post('/auth/logout');
                    } catch (e) {
                      // ignore
                    }
                    setIsUserLoggedIn(false);
                    navigate('/', { replace: true });
                  }}
                >
                  ⏻
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="gp-main">
        <Routes>
          {/* admin login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/buy" element={<BuyCoursePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* user dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardHome />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/tasks"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardTasks />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/referrals"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardReferrals />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/tasks/:taskId"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <TaskSubmitPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/withdrawals"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardWithdrawals />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          {/* admin protected */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminPaymentsPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminTasksPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/task-submissions"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminTaskSubmissionsPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminWithdrawalsPage />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
