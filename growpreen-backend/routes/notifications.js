// routes/notifications.js
import express from 'express';
import authUserCookie from '../middleware/authUserCookie.js';
import { notificationsTable } from '../services/airtableClient.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await notificationsTable
      .select({
        filterByFormula: `{UserId} = '${userId}'`,
        // remove sorting by CreatedAt because that field does NOT exist
        // sort: [{ field: 'CreatedAt', direction: 'desc' }],
        maxRecords: 30,
      })
      .all();

    const items = records.map(r => ({
      id: r.id,
      type: r.fields.Type,
      message: r.fields.Message,
      // do NOT read CreatedAt since field doesn't exist
      // createdAt: r.fields.CreatedAt,
      isRead: !!r.fields.IsRead,
    }));

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', authUserCookie, async (req, res) => {
  try {
    const id = req.params.id;
    await notificationsTable.update(id, { IsRead: true });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

export default router;
