// routes/adminPayments.js
import express from 'express';
import { paymentsTable } from '../services/airtableClient.js';
import { addUserEarning } from '../utils/updateEarnings.js';

const router = express.Router();

// GET /api/admin/payments?status=Pending|Approved|Rejected|All
router.get('/payments', async (req, res) => {
  const { status = 'All' } = req.query;

  try {
    const records = await paymentsTable.select({ view: 'Grid view' }).all();

    const items = records
      .filter(r => {
        const rowStatus = r.fields.Status || 'Pending';
        return status === 'All' || rowStatus === status;
      })
      .map(r => ({
        id: r.id,
        userId: r.fields.UserRecordId || r.fields.UserId || '',
        userMobile: r.fields.UserMobile || r.fields.Mobile || '',
        amount: Number(r.fields.Amount || 0),
        method: r.fields.Method || '',
        utr: r.fields.UTR || '',
        createdAt: r.fields.CreatedAt || '',
        approvedAt: r.fields.ApprovedAt || '',
        rejectedAt: r.fields.RejectedAt || '',
        status: r.fields.Status || 'Pending',
        isReferral: !!r.fields.IsReferral,
      }));

    res.json(items);
  } catch (e) {
    console.error('Admin payments list error:', e);
    res.status(500).json({ message: 'Failed to load payments' });
  }
});

// POST /api/admin/payments/:id/approve
router.post('/payments/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const record = await paymentsTable.find(id);

    const status = record.fields.Status || 'Pending';
    if (status === 'Approved') {
      return res.json({ success: true, message: 'Already approved' });
    }

    const amount = Number(record.fields.Amount || 0);
    const userId = record.fields.UserRecordId || record.fields.UserId;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Missing user or amount' });
    }

    await paymentsTable.update(id, {
      Status: 'Approved',
      ApprovedAt: new Date().toISOString(),
      RejectedAt: null,
    });

    await addUserEarning(userId, amount);

    res.json({ success: true });
  } catch (e) {
    console.error('Approve payment error:', e);
    res.status(500).json({ message: 'Failed to approve payment' });
  }
});

// POST /api/admin/payments/:id/reject
router.post('/payments/:id/reject', async (req, res) => {
  const { id } = req.params;

  try {
    const record = await paymentsTable.find(id);

    const status = record.fields.Status || 'Pending';
    if (status === 'Rejected') {
      return res.json({ success: true, message: 'Already rejected' });
    }

    await paymentsTable.update(id, {
      Status: 'Rejected',
      RejectedAt: new Date().toISOString(),
      ApprovedAt: null,
    });

    res.json({ success: true });
  } catch (e) {
    console.error('Reject payment error:', e);
    res.status(500).json({ message: 'Failed to reject payment' });
  }
});

export default router;
