// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  paymentsTable,
  usersTable,
  referralsTable,
} from '../services/airtableClient.js';
import {
  getUserByMobile,
  createUser,
  getUserById,
  updateUser,
} from '../services/userService.js';
import authUserCookie from '../middleware/authUserCookie.js';

const router = express.Router();

// helper: generate a personal referral code for the user
function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// helper: check approved payment exists
async function hasApprovedPayment(mobile) {
  const records = await paymentsTable
    .select({
      filterByFormula: `AND({Mobile} = '${mobile}', {Status} = 'Approved')`,
      maxRecords: 1,
    })
    .firstPage();
  return records.length > 0;
}

// helper: find referrer by code stored in payment.RefCode (now MyRefCode string)
async function findReferrerByCode(refCode) {
  if (!refCode) return null;
  try {
    const records = await usersTable
      .select({
        filterByFormula: `{MyRefCode} = '${refCode}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (!records.length) return null;
    const record = records[0];
    return { id: record.id, ...record.fields };
  } catch {
    return null;
  }
}


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { mobile, password, name, age, gender, qualification } = req.body;

    // 1) must have approved payment
    if (!await hasApprovedPayment(mobile)) {
      return res.status(400).json({ message: 'Payment not approved yet' });
    }

    // 2) prevent duplicate registration
    const existing = await getUserByMobile(mobile);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3) create user
    const passwordHash = await bcrypt.hash(password, 10);

    // generate personal referral code for this new user
    const myRefCode = generateReferralCode(8);

    const user = await createUser({
      Mobile: mobile,
      Password: passwordHash,
      Name: name,
      Age: Number(age),
      Gender: gender,
      Qualification: qualification,
      DailyEarning: 0,
      MonthlyEarning: 0,
      TotalEarning: 0,
      ReferralsCompleted: 0,
      Approved: true,
      IsNewUser: true,
      ReelTaskUnlocked: true,
      MyRefCode: myRefCode,    // <-- goes directly into Users table column
    });

    const newUserId = user.id;

    // 4) referral logic: check payment with RefCode for this mobile
    const paymentRecords = await paymentsTable
      .select({
        filterByFormula: `AND({Mobile} = '${mobile}', {RefCode} != '')`,
        maxRecords: 1,
      })
      .firstPage();

    if (paymentRecords.length) {
      const p = paymentRecords[0];
      const refCode = p.fields.RefCode || '';

      const refUser = await findReferrerByCode(refCode);

      if (refUser) {
        const referrerUserId = refUser.id;

        // credit referral amount to referrer
        const REF_BONUS = 20; // set whatever you want
        const referrer = await getUserById(referrerUserId);

        const currentTotal = Number(referrer.TotalEarning || 0);
        const newTotal = currentTotal + REF_BONUS;

        const currentCompleted = Number(referrer.ReferralsCompleted || 0);
        const newCompleted = currentCompleted + 1;

        const updates = {
          TotalEarning: newTotal,
          ReferralsCompleted: newCompleted,
        };

        if (newCompleted >= 2 && !referrer.ReelTaskUnlocked) {
          updates.ReelTaskUnlocked = true;
        }

        await updateUser(referrerUserId, updates);

        // create referral record
        const now = new Date();
        const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

        await referralsTable.create({
          ReferrerUserId: referrerUserId,
          ReferredUserId: newUserId,
          Status: 'Success',
          Month: monthKey,
        });
      }
    }

    // send back new user id and mobile (and their ref code if you want to use it in frontend)
    res.status(201).json({ id: newUserId, mobile, myRefCode });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await getUserByMobile(mobile);
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.Approved) {
      return res.status(403).json({ message: 'User not approved' });
    }

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user.id, mobile: user.Mobile },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('gp_token', token, {
      httpOnly: true,
      sameSite: 'none',   // allow cross-site
      secure: true,       // required when SameSite=None on HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });


    res.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.Mobile,
        name: user.Name,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('gp_token', { path: '/' });
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', authUserCookie, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    res.json({
      id: user.id,
      mobile: user.Mobile,
      name: user.Name,
      dailyEarning: Number(user.DailyEarning || 0),
      monthlyEarning: Number(user.MonthlyEarning || 0),
      totalEarning: Number(user.TotalEarning || 0),
      referralsCompleted: Number(user.ReferralsCompleted || 0),
      myRefCode: user.MyRefCode || '',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load user' });
  }
});


export default router;
