// routes/admin.js
import express from 'express';
import authAdminCookie from '../middleware/authAdminCookie.js';
import {
  tasksTable,
  taskTemplatesTable,
  usersTable,
  withdrawalsTable,
  notificationsTable,
  paymentsTable,
  referralsTable,
} from '../services/airtableClient.js';
import { getUserById, updateUser } from '../services/userService.js';

const router = express.Router();

// all admin routes require admin cookie
router.use(authAdminCookie);

//
// ===== Summary (admin) =====
// GET /api/admin/summary
router.get('/summary', async (req, res) => {
  try {
    // total users and balance
    const userRecords = await usersTable.select().all();
    const totalUsers = userRecords.length;
    const totalUserBalance = userRecords.reduce((sum, r) => {
      const val = Number(r.fields.TotalEarning || 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    // pending payments
    const pendingPayments = await paymentsTable
      .select({ filterByFormula: `{Status} = 'Pending'` })
      .all();

    // pending withdrawals
    const pendingWithdrawals = await withdrawalsTable
      .select({ filterByFormula: `{Status} = 'Pending'` })
      .all();

    res.json({
      totalUsers,
      totalUserBalance,
      pendingPayments: pendingPayments.length,
      pendingWithdrawals: pendingWithdrawals.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load summary' });
  }
});

//
// helper: refCode is actually the referrer user's Airtable record id
//
async function getUserByRefCode(refCode) {
  if (!refCode) return null;

  try {
    const record = await usersTable.find(refCode);
    return { id: record.id, ...record.fields };
  } catch {
    return null;
  }
}

//
// ===== Payments (admin) =====
//

// GET /api/admin/payments  -> list payments for admin UI
router.get('/payments', async (req, res) => {
  try {
    const records = await paymentsTable.select().all();

    const items = records.map(r => ({
      id: r.id,
      mobile: r.fields.Mobile || '',
      name: r.fields.Name || '',
      amount: Number(r.fields.Amount || 0),
      status: r.fields.Status || '',
      refCode: r.fields.RefCode || '',
      createdAt: r.fields.CreatedAt || '',
    }));

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load payments' });
  }
});

// POST /api/admin/payments/:id/status  -> approve / reject from UI
router.post('/payments/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await paymentsTable.update(id, { Status: status });
    res.json({ message: `Payment marked as ${status}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

//
// ===== Withdrawals (admin) =====
//

// GET /api/admin/withdrawals?status=Pending
router.get('/withdrawals', async (req, res) => {
  try {
    const status = req.query.status || 'Pending';

    const records = await withdrawalsTable
      .select({
        filterByFormula: `{Status} = '${status}'`,
      })
      .all();

    const items = records.map(r => ({
      id: r.id,
      userId: r.fields.UserId,
      amount: r.fields.Amount || 0,
      method: r.fields.Method || '',
      details: r.fields.Details || '',
      status: r.fields.Status || '',
    }));

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});

// POST /api/admin/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', async (req, res) => {
  try {
    const id = req.params.id;

    const record = await withdrawalsTable.find(id);
    const amount = Number(record.fields.Amount || 0);
    const userId = record.fields.UserId;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal record' });
    }

    await withdrawalsTable.update(id, {
      Status: 'Approved',
    });

    await notificationsTable.create({
      UserId: userId,
      Type: 'WithdrawalApproved',
      Message: `Your withdrawal of ₹${amount} has been approved.`,
      IsRead: false,
    });

    res.json({ message: 'Withdrawal approved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to approve withdrawal' });
  }
});

// POST /api/admin/withdrawals/:id/reject
router.post('/withdrawals/:id/reject', async (req, res) => {
  try {
    const id = req.params.id;

    const record = await withdrawalsTable.find(id);
    const amount = Number(record.fields.Amount || 0);
    const userId = record.fields.UserId;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal record' });
    }

    const user = await getUserById(userId);
    const currentTotal = Number(user.TotalEarning || 0);
    const newTotal = currentTotal + amount;
    await updateUser(userId, { TotalEarning: newTotal });

    await withdrawalsTable.update(id, {
      Status: 'Rejected',
    });

    await notificationsTable.create({
      UserId: userId,
      Type: 'WithdrawalRejected',
      Message: `Your withdrawal of ₹${amount} was rejected. Amount has been added back to your balance.`,
      IsRead: false,
    });

    res.json({ message: 'Withdrawal rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to reject task' });
  }
});

//
// ===== Task submissions (admin) =====
//

// GET /api/admin/task-submissions?status=Pending
router.get('/task-submissions', async (req, res) => {
  try {
    const status = req.query.status || 'Pending';

    const records = await tasksTable
      .select({
        filterByFormula: `{Status} = '${status}'`,
        sort: [{ field: 'Date', direction: 'desc' }],
      })
      .all();

    const submissions = [];
    for (const r of records) {
      const f = r.fields;
      let userMobile = '';
      let userName = '';

      if (f.UserId) {
        try {
          const userRecord = await usersTable.find(f.UserId);
          userMobile = userRecord.fields.Mobile;
          userName = userRecord.fields.Name;
        } catch {
          // ignore missing user
        }
      }

      let taskTitle = '';
      if (f.TaskTemplateId) {
        try {
          const tpl = await taskTemplatesTable.find(f.TaskTemplateId);
          taskTitle = tpl.fields.Title;
        } catch {
          // ignore missing template
        }
      }

      submissions.push({
        id: r.id,
        userId: f.UserId,
        userName,
        userMobile,
        taskTitle,
        proofLink: f.ProofLink || '',
        proofScreenshot: f.ProofScreenshot || '',
        note: f.ProofNote || '',
        status: f.Status,
        date: f.Date,
      });
    }

    res.json(submissions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load task submissions' });
  }
});

// POST /api/admin/tasks/:id/reject
router.post('/tasks/:id/reject', async (req, res) => {
  try {
    const taskId = req.params.id;
    const record = await tasksTable.find(taskId);
    const userId = record.fields.UserId;

    await tasksTable.update(taskId, { Status: 'Rejected' });

    await notificationsTable.create({
      UserId: userId,
      Type: 'TaskRejected',
      Message:
        'Your task submission was rejected. Please check your proof and try again.',
      IsRead: false,
    });

    res.json({ message: 'Task rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to reject task' });
  }
});

// POST /api/admin/tasks/:id/approve
router.post('/tasks/:id/approve', async (req, res) => {
  try {
    const taskId = req.params.id;
    const record = await tasksTable.find(taskId);
    const f = record.fields;
    const userId = f.UserId;

    let reward = Number(f.RewardAmount || 0);
    if (!reward && f.TaskTemplateId) {
      const tpl = await taskTemplatesTable.find(f.TaskTemplateId);
      reward = Number(tpl.fields.RewardAmount || 0);
    }

    await tasksTable.update(taskId, { Status: 'Approved', RewardAmount: reward });

    const user = await getUserById(userId);

    const newDaily = Number(user.DailyEarning || 0) + reward;
    const newMonthly = Number(user.MonthlyEarning || 0) + reward;
    const newTotal = Number(user.TotalEarning || 0) + reward;

    await updateUser(userId, {
      DailyEarning: newDaily,
      MonthlyEarning: newMonthly,
      TotalEarning: newTotal,
      IsNewUser: false,
    });

    await notificationsTable.create({
      UserId: userId,
      Type: 'TaskApproved',
      Message: `Your task has been approved and ₹${reward} added to your balance.`,
      IsRead: false,
    });

    res.json({ message: 'Task approved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to approve task' });
  }
});

//
// ===== Task templates (admin) =====
//

// GET /api/admin/task-templates
router.get('/task-templates', async (req, res) => {
  try {
    const records = await taskTemplatesTable.select().all();
    const templates = records.map(r => ({
      id: r.id,
      title: r.fields.Title,
      description: r.fields.Description || '',
      rewardAmount: r.fields.RewardAmount || 0,
      period: r.fields.Period || 'OneTime',
      actionType: r.fields.ActionType || 'OTHER',
      isActive: !!r.fields.IsActive,
    }));
    res.json(templates);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load task templates' });
  }
});

// POST /api/admin/task-templates
router.post('/task-templates', async (req, res) => {
  try {
    const { title, description, rewardAmount, period, actionType } = req.body;

    const record = await taskTemplatesTable.create({
      Title: title,
      Description: description,
      RewardAmount: Number(rewardAmount),
      Period: period,
      ActionType: actionType,
      IsActive: true,
    });

    res.status(201).json({ id: record.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create task template' });
  }
});

// PATCH /api/admin/task-templates/:id
router.patch('/task-templates/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    const id = req.params.id;

    const record = await taskTemplatesTable.update(id, {
      IsActive: !!isActive,
    });

    res.json({ id: record.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update task template' });
  }
});

// DELETE /api/admin/task-templates/:id
router.delete('/task-templates/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await taskTemplatesTable.destroy(id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete task template' });
  }
});

//
// ===== Users (admin) =====
//

// GET /api/admin/users  -> list all users with balance and referrals
router.get('/users', async (req, res) => {
  try {
    const records = await usersTable.select().all();

    const users = records.map(r => ({
      id: r.id,
      name: r.fields.Name || '',
      mobile: r.fields.Mobile || '',
      totalEarning: Number(r.fields.TotalEarning || 0),
      dailyEarning: Number(r.fields.DailyEarning || 0),
      monthlyEarning: Number(r.fields.MonthlyEarning || 0),
      referralsCompleted: Number(r.fields.ReferralsCompleted || 0),
      approved: !!r.fields.Approved,
    }));

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

export default router;
