// routes/adminTasks.js
import express from 'express';
import { taskTemplatesTable } from '../services/airtableClient.js';

const router = express.Router();

// DELETE /api/admin/task-templates/:id
router.delete('/task-templates/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await taskTemplatesTable.destroy(id);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete task template error:', e);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;
