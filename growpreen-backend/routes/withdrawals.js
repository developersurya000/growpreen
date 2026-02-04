// routes/withdrawals.js
import express from 'express';
import authUserCookie from '../middleware/authUserCookie.js';
import { withdrawalsTable } from '../services/airtableClient.js';
import { getUserById, updateUser } from '../services/userService.js';

const router = express.Router();

// GET /api/withdrawals/balance
router.get('/balance', authUserCookie, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const balance = Number(user.TotalEarning || 0);
    res.json({ balance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load balance' });
  }
});

// GET /api/withdrawals/my
router.get('/my', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await withdrawalsTable
      .select({
        filterByFormula: `{UserId} = '${userId}'`,
        // no 
        //  column now, so no sort by it
        // sort: [{ field: 'CreatedAt', direction: 'desc' }],
        maxRecords: 20,
      })
      .all();

    const items = records.map(r => ({
      id: r.id,
      amount: r.fields.Amount || 0,
      method: r.fields.Method || '',
      status: r.fields.Status || 'Pending',
      // you deleted CreatedAt / ProcessedAt from table
      // createdAt: r.fields.CreatedAt,
      // processedAt: r.fields.ProcessedAt,
    }));

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// POST /api/withdrawals/request
router.post('/request', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method, details } = req.body;

    const user = await getUserById(userId);
    const balance = Number(user.TotalEarning || 0);
    const numAmount = Number(amount);
    const MIN = 200;

    if (Number.isNaN(numAmount) || numAmount < MIN) {
      return res.status(400).json({ message: `Minimum withdrawal is ₹${MIN}` });
    }

    if (numAmount > balance) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // only simple fields that exist in Withdrawals table
    await withdrawalsTable.create({
      UserId: userId,
      Amount: numAmount,
      Method: method || '',
      Details: details || '',
      Status: 'Pending',
    });

    // lock funds
    const newTotal = balance - numAmount;
    await updateUser(userId, { TotalEarning: newTotal });

    res.status(201).json({ success: true });
  } catch (e) {
  console.error('Withdrawal error:', e);   // keep full object
  res.status(500).json({
    message: 'Failed to create withdrawal',
    error: e?.message || 'Unknown error',
  });
}
});

export default router;
