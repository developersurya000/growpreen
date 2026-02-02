// routes/profile.js
import express from 'express';
import authUserCookie from '../middleware/authUserCookie.js';
import { getUserById, updateUser } from '../services/userService.js';

const router = express.Router();

// GET /api/profile/payout
router.get('/payout', authUserCookie, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({
      method: user.PayoutMethod || '',
      upiName: user.PayoutUPIName || '',
      upiMobile: user.PayoutUPIMobile || '',
      upiId: user.PayoutUPIID || '',
      bankName: user.PayoutBankName || '',
      accountNumber: user.PayoutAccountNumber || '',
      ifsc: user.PayoutIFSC || '',
      accountHolder: user.PayoutAccountHolder || '',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load payout profile' });
  }
});

// POST /api/profile/payout
router.post('/payout', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      method,
      upiName,
      upiMobile,
      upiId,
      bankName,
      accountNumber,
      ifsc,
      accountHolder,
    } = req.body;

    await updateUser(userId, {
      PayoutMethod: method,
      PayoutUPIName: upiName || '',
      PayoutUPIMobile: upiMobile || '',
      PayoutUPIID: upiId || '',
      PayoutBankName: bankName || '',
      PayoutAccountNumber: accountNumber || '',
      PayoutIFSC: ifsc || '',
      PayoutAccountHolder: accountHolder || '',
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to save payout profile' });
  }
});

export default router;
