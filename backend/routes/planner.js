const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const WeeklyTask = require('../models/WeeklyTask');
const Student = require('../models/Student');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

function getWeekNumber(d) { const date = new Date(d); const start = new Date(date.getFullYear(), 0, 1); return Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7); }

router.get('/current-week', async (req, res) => {
  try {
    const now = new Date();
    const weekNum = getWeekNumber(now);
    let week = await WeeklyTask.findOne({ studentId: req.user._id, weekNumber: weekNum, year: now.getFullYear() });
    if (!week) { week = new WeeklyTask({ studentId: req.user._id, weekNumber: weekNum, year: now.getFullYear(), tasks: [] }); await week.save(); }
    res.json(week);
  } catch (e) { res.status(500).json({ error: 'Failed to get current week.' }); }
});

router.get('/week/:weekNum', async (req, res) => {
  try {
    const week = await WeeklyTask.findOne({ studentId: req.user._id, weekNumber: parseInt(req.params.weekNum), year: new Date().getFullYear() });
    res.json(week || { tasks: [] });
  } catch (e) { res.status(500).json({ error: 'Failed to get week.' }); }
});

router.post('/task', async (req, res) => {
  try {
    const { title, category, microTasks, dueDate } = req.body;
    const now = new Date();
    const weekNum = getWeekNumber(now);
    let week = await WeeklyTask.findOne({ studentId: req.user._id, weekNumber: weekNum, year: now.getFullYear() });
    if (!week) { week = new WeeklyTask({ studentId: req.user._id, weekNumber: weekNum, year: now.getFullYear(), tasks: [] }); }
    week.tasks.push({ title, category: category || 'Other', microTasks: (microTasks || []).map(t => ({ title: t, completed: false })), completed: false, dueDate });
    await week.save();
    res.json(week);
  } catch (e) { res.status(500).json({ error: 'Failed to add task.' }); }
});

router.put('/task/:id/complete', async (req, res) => {
  try {
    const { microTaskId } = req.body;
    const now = new Date();
    const weekNum = getWeekNumber(now);
    const week = await WeeklyTask.findOne({ studentId: req.user._id, weekNumber: weekNum, year: now.getFullYear() });
    if (!week) return res.status(404).json({ error: 'Week not found.' });
    const task = week.tasks.id(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (microTaskId) {
      const mt = task.microTasks.id(microTaskId);
      if (mt) mt.completed = !mt.completed;
      task.completed = task.microTasks.every(m => m.completed);
    } else { task.completed = !task.completed; }
    await week.save();
    // Update streak
    const student = await Student.findById(req.user._id);
    const lastActive = student.lastActiveDate;
    const today = new Date().toDateString();
    if (!lastActive || new Date(lastActive).toDateString() !== today) {
      const diffDays = lastActive ? Math.floor((new Date() - new Date(lastActive)) / 86400000) : 999;
      student.currentStreak = diffDays <= 1 ? student.currentStreak + 1 : 1;
      student.longestStreak = Math.max(student.longestStreak, student.currentStreak);
      student.lastActiveDate = new Date();
      await student.save();
    }
    res.json(week);
  } catch (e) { res.status(500).json({ error: 'Failed to complete task.' }); }
});

router.get('/streak', async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    res.json({ current: student.currentStreak, longest: student.longestStreak, lastActive: student.lastActiveDate });
  } catch (e) { res.status(500).json({ error: 'Failed to get streak.' }); }
});

router.get('/heatmap', async (req, res) => {
  try {
    const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const weeks = await WeeklyTask.find({ studentId: req.user._id, createdAt: { $gte: threeMonthsAgo } });
    const heatmap = {};
    weeks.forEach(w => {
      const date = w.createdAt.toISOString().split('T')[0];
      const completed = w.tasks.filter(t => t.completed).length;
      heatmap[date] = (heatmap[date] || 0) + completed;
    });
    res.json(Object.entries(heatmap).map(([date, count]) => ({ date, count })));
  } catch (e) { res.status(500).json({ error: 'Failed to get heatmap.' }); }
});

module.exports = router;
