// routes/referrals.js
import express from 'express';
import { referralsTable } from '../services/airtableClient.js';
import { getUserById, updateUser } from '../services/userService.js';
import authUserCookie from '../middleware/authUserCookie.js';

const router = express.Router();

// POST /api/referrals/success
router.post('/success', async (req, res) => {
  try {
    const { referrerUserId, referredUserId } = req.body;
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

    await referralsTable.create({
      ReferrerUserId: referrerUserId,
      ReferredUserId: referredUserId,
      Status: 'Success',
      Month: monthKey,
    });

    const user = await getUserById(referrerUserId);

    const newCompleted = (user.ReferralsCompleted || 0) + 1;
    const updates = { ReferralsCompleted: newCompleted };

    if (newCompleted >= 2 && !user.ReelTaskUnlocked) {
      updates.ReelTaskUnlocked = true;
    }

    await updateUser(referrerUserId, updates);

    res.json({ message: 'Referral recorded' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to record referral' });
  }
});

router.get('/summary', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

    const records = await referralsTable
      .select({
        filterByFormula: `AND({ReferrerUserId} = '${userId}', {Status} = 'Success', {Month} = '${monthKey}')`,
      })
      .all();

    const count = records.length;

    let salary = 0;
    if (count >= 24) salary = 2200;
    else if (count >= 12) salary = 1100;

    const referralEarning = count * 30;
    const totalMonthlyReferralIncome = referralEarning + salary;

    res.json({
      month: monthKey,
      count,
      salary,
      referralEarning,
      totalMonthlyReferralIncome,
      totalCompleted: user.ReferralsCompleted || 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load referral summary' });
  }
});

export default router;
