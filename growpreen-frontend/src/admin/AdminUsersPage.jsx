// src/admin/AdminUsersPage.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="gp-card">
      <h2>Users</h2>
      <p className="gp-subtitle">
        View user balances, referrals and approval status without opening Airtable.
      </p>

      {loading && <p>Loading users...</p>}

      {!loading && (
        <div className="gp-table-wrapper">
          <table className="gp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Total earning</th>
                <th>Daily</th>
                <th>Monthly</th>
                <th>Referrals</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.mobile}</td>
                  <td>₹{u.totalEarning}</td>
                  <td>₹{u.dailyEarning}</td>
                  <td>₹{u.monthlyEarning}</td>
                  <td>{u.referralsCompleted}</td>
                  <td>{u.approved ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
