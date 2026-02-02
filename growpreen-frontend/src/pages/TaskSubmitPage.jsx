import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TaskSubmitPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);

  const [link, setLink] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [note, setNote] = useState('');

  const [status, setStatus] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/tasks/template/${taskId}`);
        setTemplate(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [taskId]);

  async function handleSubmit(e) {
    e.preventDefault();

    // 🚫 prevent double submission
    if (submitLoading) return;

    setStatus('');
    setSubmitLoading(true);

    try {
      await api.post('/tasks/submit', {
        taskTemplateId: taskId,
        link,
        screenshotUrl,
        note,
      });

      setStatus('success');

      setTimeout(() => {
        navigate('/dashboard/tasks');
      }, 1200);
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setSubmitLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="gp-page">
        <div className="gp-card">Loading...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="gp-page">
        <div className="gp-card">Task not found.</div>
      </div>
    );
  }

  return (
    <div className="gp-page">
      <div className="gp-card">
        <h2>{template.title}</h2>

        <p className="gp-task-desc">{template.description}</p>

        <p className="gp-task-meta">
          Reward: <strong>₹{template.rewardAmount}</strong> · {template.period}
        </p>

        <form
          className="gp-form"
          style={{ marginTop: '1.2rem' }}
          onSubmit={handleSubmit}
        >
          <label className="gp-field">
            <span>Task link (reel / profile / post)</span>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              disabled={submitLoading}
            />
          </label>

          <label className="gp-field">
            <span>Screenshot link (Google Drive / ImgBB etc.)</span>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              disabled={submitLoading}
            />
          </label>

          <label className="gp-field">
            <span>Notes (optional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitLoading}
            />
          </label>

          <button
            type="submit"
            className="gp-btn-primary"
            disabled={submitLoading}
          >
            {submitLoading ? <span className="gp-spinner" /> : 'Submit for verification'}
          </button>

          {status === 'success' && (
            <p className="gp-alert gp-alert-success">
              Task submitted. We will verify within 2–3 hours.
            </p>
          )}

          {status === 'error' && (
            <p className="gp-alert gp-alert-error">
              Submit failed. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
