import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DashboardTasks({ embedded = false }) {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoadingId, setButtonLoadingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [tasksRes, historyRes] = await Promise.all([
          api.get('/tasks/available'),
          api.get('/tasks/history'),
        ]);
        setTasks(tasksRes.data);
        setHistory(historyRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGo = taskId => {
    if (buttonLoadingId) return; // prevent double click
    setButtonLoadingId(taskId);
    navigate(`/dashboard/tasks/${taskId}`);
  };

  const content = (
    <>
      <h2>Earn by completing tasks</h2>
      <p className="gp-subtitle">
        Complete simple tasks, submit proof and get paid after verification.
      </p>

      <div className="gp-task-list">
        {loading && <div>Loading tasks...</div>}

        {!loading &&
          tasks.map(task => (
            <div key={task.id} className="gp-task-card">
              <div className="gp-task-main">
                <h3>{task.title}</h3>
                <p className="gp-task-desc">{task.description}</p>
                <p className="gp-task-meta">
                  Reward: <strong>₹{task.rewardAmount}</strong> · {task.period}
                </p>
              </div>

              <button
                className="gp-btn-primary"
                disabled={buttonLoadingId === task.id}
                onClick={() => handleGo(task.id)}
              >
                {buttonLoadingId === task.id ? 'Loading...' : 'Go'}
              </button>
            </div>
          ))}

        {!loading && tasks.length === 0 && (
          <p>No tasks available right now.</p>
        )}

        {!loading && history.length > 0 && (
          <div style={{ marginTop: '1.6rem' }}>
            <h3>Recent task activity</h3>
            <div className="gp-table-wrapper">
              <table className="gp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task ID</th>
                    <th>Status</th>
                    <th>Reward (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td>{h.date || '-'}</td>
                      <td>{h.taskTemplateId || '-'}</td>
                      <td>{h.status}</td>
                      <td>{h.rewardAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Standalone page
  if (!embedded) {
    return (
      <div className="gp-page">
        <div className="gp-card">{content}</div>
      </div>
    );
  }

  // Embedded mode
  return content;
}
