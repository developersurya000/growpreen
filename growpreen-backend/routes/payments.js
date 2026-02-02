// routes/payments.js
import express from 'express';
import { paymentsTable } from '../services/airtableClient.js';

const router = express.Router();

// POST /api/payments/create
router.post('/create', async (req, res) => {
  try {
    const { mobile, amount, utr, refCode } = req.body;

    if (!mobile || !amount || !utr) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const record = await paymentsTable.create({
      Mobile: mobile,
      Amount: Number(amount),
      UTR: utr,
      Status: 'Pending',
      RefCode: refCode || '', // can be empty if no referral
    });

    res.status(201).json({ id: record.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create payment' });
  }
});

export default router;
