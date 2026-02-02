// src/components/NotificationsBell.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function NotificationsBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/notifications');
        setItems(res.data);
      } catch (e) {
        // ignore if not logged in
      }
    }
    load();
  }, []);

  const unreadCount = items.filter(n => !n.isRead).length;

  async function markRead(id) {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="gp-notif-wrapper">
      <button
        type="button"
        className="gp-notif-btn"
        onClick={() => setOpen(o => !o)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="gp-notif-badge">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="gp-notif-panel">
          {items.length === 0 ? (
            <p className="gp-notif-empty">No notifications yet.</p>
          ) : (
            items.map(n => (
              <div
                key={n.id}
                className={`gp-notif-item ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <p>{n.message}</p>
                <span className="gp-notif-time">{n.createdAt || ''}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
