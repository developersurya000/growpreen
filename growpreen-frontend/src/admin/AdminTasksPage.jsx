import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminTasksPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [period, setPeriod] = useState('Daily');
  const [actionType, setActionType] = useState('REEL');

  async function loadTemplates() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/task-templates');
      setTemplates(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/admin/task-templates', {
        title,
        description,
        rewardAmount: Number(reward),
        period,
        actionType,
      });
      setTitle('');
      setDescription('');
      setReward('');
      setActionType('REEL');
      await loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  }

  async function toggleActive(id, isActive) {
    try {
      await api.patch(`/admin/task-templates/${id}`, { isActive: !isActive });
      await loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  }

  async function deleteTemplate(id) {
    try {
      await api.delete(`/admin/task-templates/${id}`);
      await loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  }

  return (
    <div className="gp-page">
      <div className="gp-card">
        <h2>Task templates</h2>
        <p className="gp-subtitle">
          Create and manage earning tasks shown to users in the app.
        </p>

        {error && (
          <p className="gp-alert gp-alert-error" style={{ marginTop: '0.75rem' }}>
            {error}
          </p>
        )}

        <form
          className="gp-form"
          onSubmit={handleCreate}
          style={{ marginTop: '1rem' }}
        >
          <h3>Create new task</h3>

          <label className="gp-field">
            <span>Title</span>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="gp-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </label>

          <label className="gp-field">
            <span>Reward (₹)</span>
            <input
              type="number"
              value={reward}
              onChange={e => setReward(e.target.value)}
              required
            />
          </label>

          <label className="gp-field">
            <span>Period</span>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option>Daily</option>
              <option>Monthly</option>
              <option>OneTime</option>
            </select>
          </label>

          <label className="gp-field">
            <span>Action type</span>
            <select
              value={actionType}
              onChange={e => setActionType(e.target.value)}
            >
              <option value="REEL">Reel / Video</option>
              <option value="JOIN_GROUP">Join group</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <button className="gp-btn-primary" type="submit">
            Create task
          </button>
        </form>

        <hr style={{ margin: '1.5rem 0' }} />

        <h3>Existing tasks</h3>

        {loading ? (
          <p>Loading...</p>
        ) : templates.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <div className="gp-task-list-admin">
            {templates.map(t => (
              <div key={t.id} className="gp-task-card-admin">
                <div>
                  <h4>{t.title}</h4>
                  <p className="gp-subtitle">{t.description}</p>
                  <p className="gp-label">
                    Reward: ₹{t.rewardAmount} · {t.period} · {t.actionType}
                  </p>
                </div>
                <div className="gp-table-actions">
                  <button
                    className="gp-btn-secondary"
                    onClick={() => toggleActive(t.id, t.isActive)}
                  >
                    {t.isActive ? 'Disable' : 'Activate'}
                  </button>
                  <button
                    className="gp-btn-secondary"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#b91c1c' }}
                    onClick={() => deleteTemplate(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
