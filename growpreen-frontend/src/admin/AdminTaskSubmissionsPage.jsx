import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminTaskSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/task-submissions?status=Pending');
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id) {
    try {
      await api.post(`/admin/tasks/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve task');
    }
  }

  async function handleReject(id) {
    try {
      await api.post(`/admin/tasks/${id}/reject`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject task');
    }
  }

  if (loading) {
    return (
      <div className="gp-page">
        <div className="gp-card gp-admin-inner">
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-page">
      <div className="gp-card gp-admin-inner">
        <h2 className="gp-admin-heading">Pending task submissions</h2>
        <p className="gp-subtitle">
          Review proofs submitted by users and approve or reject.
        </p>

        {error && (
          <p className="gp-alert gp-alert-error" style={{ marginTop: '0.75rem' }}>
            {error}
          </p>
        )}

        {submissions.length === 0 ? (
          <p style={{ marginTop: '1rem' }}>No pending tasks.</p>
        ) : (
          <div className="gp-table-wrapper gp-admin-table-wrapper">
            <table className="gp-table gp-admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Task</th>
                  <th>Proof</th>
                  <th>Submitted on</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="gp-table-main">
                        <div>{s.userName || 'Unknown'}</div>
                        <div className="gp-table-sub">{s.userMobile}</div>
                      </div>
                    </td>
                    <td>{s.taskTitle || 'Task'}</td>
                    <td>
                      {s.proofLink && (
                        <a
                          href={s.proofLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open link
                        </a>
                      )}
                      {s.proofScreenshot && (
                        <>
                          <br />
                          <a
                            href={s.proofScreenshot}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Screenshot
                          </a>
                        </>
                      )}
                      {!s.proofLink && !s.proofScreenshot && (
                        <span className="gp-table-sub">No proof</span>
                      )}
                    </td>
                    <td>{s.date || '-'}</td>
                    <td>
                      <div className="gp-table-actions">
                        <button
                          className="gp-btn-primary"
                          style={{ paddingInline: '0.7rem' }}
                          onClick={() => handleApprove(s.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="gp-btn-secondary"
                          style={{ paddingInline: '0.7rem' }}
                          onClick={() => handleReject(s.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
