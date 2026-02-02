// routes/tasks.js
import express from 'express';
import authUserCookie from '../middleware/authUserCookie.js';
import { tasksTable,taskTemplatesTable } from '../services/airtableClient.js';
import { getUserById } from '../services/userService.js';

const router = express.Router();


// POST /api/tasks/submit
router.post('/submit', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskTemplateId, link, screenshotUrl, note } = req.body;

    const todayStr = new Date().toISOString().slice(0, 10);

    const record = await tasksTable.create({
      UserId: userId,
      TaskTemplateId: taskTemplateId,
      Status: 'Pending',
      RewardAmount: 0,          // will use template reward on approval
      ProofLink: link || '',
      ProofScreenshot: screenshotUrl || '',
      ProofNote: note || '',
      Date: todayStr,
    });

    res.status(201).json({ id: record.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to submit task' });
  }
});


// GET /api/tasks/template/:id
router.get('/template/:id', authUserCookie, async (req, res) => {
  try {
    const id = req.params.id;
    const record = await taskTemplatesTable.find(id);
    res.json({
      id: record.id,
      title: record.fields.Title,
      description: record.fields.Description || '',
      rewardAmount: record.fields.RewardAmount || 0,
      period: record.fields.Period || 'OneTime',
      actionType: record.fields.ActionType || 'OTHER',
    });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: 'Task template not found' });
  }
});


// GET /api/tasks/available
router.get('/available', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthKey = todayStr.slice(0, 7);

    // 1) get all active templates
    const tplRecords = await taskTemplatesTable
      .select({ filterByFormula: '{IsActive}' })
      .all();

    // 2) get this user's submissions
    const taskRecords = await tasksTable
      .select({
        filterByFormula: `{UserId} = '${userId}'`,
      })
      .all();

    const submissions = taskRecords.map(r => ({
      templateId: r.fields.TaskTemplateId,
      status: r.fields.Status,
      date: r.fields.Date,           // YYYY-MM-DD string
    }));

    function isAvailableForTemplate(tplId, period) {
      const related = submissions.filter(s => s.templateId === tplId);

      if (period === 'Daily') {
        // if already Approved or Pending for today, hide
        return !related.some(s => s.date === todayStr && (s.status === 'Pending' || s.status === 'Approved'));
      }

      if (period === 'Monthly') {
        // hide if there is an Approved in this month
        return !related.some(s =>
          s.status === 'Approved' && s.date && s.date.startsWith(monthKey)
        );
      }

      // OneTime: hide if ever Approved
      return !related.some(s => s.status === 'Approved');
    }

    const tasks = tplRecords
      .map(r => ({
        id: r.id,
        title: r.fields.Title,
        description: r.fields.Description || '',
        rewardAmount: r.fields.RewardAmount || 0,
        period: r.fields.Period || 'OneTime',
        actionType: r.fields.ActionType || 'OTHER',
      }))
      .filter(t => isAvailableForTemplate(t.id, t.period));

    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load tasks' });
  }
});



// GET /api/tasks/daily-status
router.get('/daily-status', authUserCookie, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user.ReelTaskUnlocked) {
      return res.json({
        available: false,
        reason: 'Reel task locked. Refer at least 2 users to unlock again.',
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const records = await tasksTable
      .select({
        filterByFormula: `AND({UserId} = '${user.id}', {Type} = 'Reel', {Date} = '${todayStr}')`,
        maxRecords: 1,
      })
      .firstPage();

    if (!records.length) {
      return res.json({ available: true, status: 'none' });
    }

    const task = records[0];
    return res.json({
      available: true,
      status: task.fields.Status,
      taskId: task.id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to get daily status' });
  }
});

// GET /api/tasks/history
router.get('/history', authUserCookie, async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await tasksTable
      .select({
        filterByFormula: `{UserId} = '${userId}'`,
        sort: [{ field: 'Date', direction: 'desc' }],
        maxRecords: 20,
      })
      .all();

    const history = records.map(r => ({
      id: r.id,
      taskTemplateId: r.fields.TaskTemplateId,
      status: r.fields.Status,
      rewardAmount: r.fields.RewardAmount || 0,
      date: r.fields.Date,
    }));

    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load task history' });
  }
});


// POST /api/tasks/submit-reel
router.post('/submit-reel', authUserCookie, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const { link } = req.body;

    if (!user.ReelTaskUnlocked) {
      return res.status(400).json({
        message: 'Reel task locked. Refer at least 2 users to unlock.',
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const existing = await tasksTable
      .select({
        filterByFormula: `AND({UserId} = '${user.id}', {Type} = 'Reel', {Date} = '${todayStr}')`,
        maxRecords: 1,
      })
      .firstPage();

    if (existing.length) {
      return res.status(400).json({ message: 'Reel already submitted today' });
    }

    const record = await tasksTable.create({
      UserId: user.id,
      Type: 'Reel',
      Period: 'Daily',
      Status: 'Pending',
      RewardAmount: 20,
      ProofLink: link,
      Date: todayStr,
    });

    res.status(201).json({ id: record.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to submit reel' });
  }
});

router.delete('/task-templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await base('TaskTemplates').destroy(id);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete task template error', e);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});


export default router;
