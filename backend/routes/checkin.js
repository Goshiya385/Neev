const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const CheckIn = require('../models/CheckIn');
const axios = require('axios');

router.use(auth);
router.use(roleCheck('student'));

// POST /api/checkin/daily — Submit daily check-in
router.post('/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { studyHours, mood, workedOn, productivity, goals, reflection } = req.body;

    const checkin = await CheckIn.findOneAndUpdate(
      { studentId: req.user._id, date: today },
      { studyHours, mood, workedOn, productivity, goals, reflection },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, checkin, message: 'Check-in saved! Keep going 🔥' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/checkin/today — Get today's check-in
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkin = await CheckIn.findOne({ studentId: req.user._id, date: today });
    res.json(checkin || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/checkin/history — Get past check-ins
router.get('/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const checkins = await CheckIn.find({
      studentId: req.user._id,
      createdAt: { $gte: since }
    }).sort({ date: -1 });
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/checkin/stats — Weekly/monthly stats
router.get('/stats', async (req, res) => {
  try {
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const weekCheckins = await CheckIn.find({ studentId: req.user._id, createdAt: { $gte: last7 } });
    const monthCheckins = await CheckIn.find({ studentId: req.user._id, createdAt: { $gte: last30 } });

    const weekHours = weekCheckins.reduce((sum, c) => sum + (c.studyHours || 0), 0);
    const monthHours = monthCheckins.reduce((sum, c) => sum + (c.studyHours || 0), 0);
    const avgMood = weekCheckins.length ? weekCheckins.reduce((s, c) => {
      const moodMap = { great: 5, good: 4, okay: 3, stressed: 2, low: 1 };
      return s + (moodMap[c.mood] || 3);
    }, 0) / weekCheckins.length : 3;

    res.json({
      week: { totalHours: weekHours, checkins: weekCheckins.length, avgProductivity: weekCheckins.length ? (weekCheckins.reduce((s, c) => s + (c.productivity || 3), 0) / weekCheckins.length).toFixed(1) : 0 },
      month: { totalHours: monthHours, checkins: monthCheckins.length },
      avgMood: avgMood.toFixed(1),
      streak: weekCheckins.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/checkin/prompt — AI generates today's check-in questions
router.get('/prompt', async (req, res) => {
  try {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hour = new Date().getHours();
    let timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    // Get recent check-ins for context
    const recent = await CheckIn.find({ studentId: req.user._id }).sort({ date: -1 }).limit(3);
    const recentContext = recent.length > 0
      ? `Recent activity: Last study hours ${recent[0]?.studyHours || 0}h, mood was ${recent[0]?.mood || 'unknown'}`
      : 'First time checking in!';

    const prompts = {
      morning: {
        greeting: `Good morning! ☀️ Ready to slay this ${day}?`,
        questions: ["What's your study plan for today?", "How many hours are you targeting?", "Any specific subject focus?"]
      },
      afternoon: {
        greeting: `Hey! How's ${day} going so far? 🌤️`,
        questions: ["How many hours have you studied today?", "What did you work on?", "How's the vibe?"]
      },
      evening: {
        greeting: `${day} wrap-up time! 🌙`,
        questions: ["How many hours did you study today?", "What did you accomplish?", "How are you feeling?", "Goals for tomorrow?"]
      }
    };

    res.json({
      ...prompts[timeOfDay],
      day, timeOfDay, recentContext,
      moodOptions: ['great', 'good', 'okay', 'stressed', 'low'],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
