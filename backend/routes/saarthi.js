const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const axios = require('axios');
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const SkillProgress = require('../models/SkillProgress');
const Project = require('../models/Project');
const ChatHistory = require('../models/ChatHistory');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

// ═══════ EXISTING: POST /chat ═══════
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const student = await Student.findById(req.user._id);
    const marks = await Marks.find({ studentId: req.user._id });
    const skills = await SkillProgress.find({ studentId: req.user._id });
    const projects = await Project.find({ studentId: req.user._id });

    // Save user message to history
    await ChatHistory.findOneAndUpdate(
      { studentId: req.user._id },
      { $push: { messages: { role: 'user', content: message, timestamp: new Date() } }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    try {
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/saarthi/chat`, {
        message, history: history || [],
        studentContext: { name: student.name, semester: student.semester, cgpa: student.cgpa, branch: student.branch, careerGoal: student.careerGoal, backlogs: student.backlogs, placementReadiness: student.placementReadiness, skills: skills.map(s => ({ name: s.skillName, completion: s.completionPercent })), projects: projects.map(p => ({ title: p.title, status: p.status })), marksSummary: marks.length + ' subjects tracked' }
      });

      // Save assistant response to history
      const content = mlRes.data.content || mlRes.data.response || '';
      await ChatHistory.findOneAndUpdate(
        { studentId: req.user._id },
        { $push: { messages: { role: 'assistant', content, timestamp: new Date() } }, updatedAt: new Date() }
      );

      res.json(mlRes.data);
    } catch {
      const fallback = `Hey ${student.name || 'there'}! I'm Saarthi, your AI mentor. The ML service is currently unavailable, but I'm here to help! Based on your profile — Sem ${student.semester}, ${student.branch} branch, CGPA ${student.cgpa || 'not set'} — I'd recommend focusing on building consistent habits. What would you like guidance on?`;
      await ChatHistory.findOneAndUpdate(
        { studentId: req.user._id },
        { $push: { messages: { role: 'assistant', content: fallback, timestamp: new Date() } }, updatedAt: new Date() }
      );
      res.json({ response: fallback, source: 'fallback' });
    }
  } catch (e) { res.status(500).json({ error: 'Failed to get Saarthi response.' }); }
});

// ═══════ NEW: SSE STREAMING ═══════
router.get('/stream', async (req, res) => {
  const { message } = req.query;
  if (!message) return res.status(400).json({ error: 'Message required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.flushHeaders();

  try {
    // Save user message
    await ChatHistory.findOneAndUpdate(
      { studentId: req.user._id },
      { $push: { messages: { role: 'user', content: message, timestamp: new Date() } }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Fetch student context
    const student = await Student.findById(req.user._id);
    const history = await ChatHistory.findOne({ studentId: req.user._id });
    const last10 = (history?.messages || []).slice(-10);

    // Call ML streaming endpoint
    const mlResponse = await axios({
      method: 'POST',
      url: `${process.env.ML_SERVICE_URL}/ml/saarthi/stream`,
      data: { message, history: last10, studentContext: { name: student.name, semester: student.semester, cgpa: student.cgpa, branch: student.branch, careerGoal: student.careerGoal } },
      responseType: 'stream',
      timeout: 30000
    });

    let fullResponse = '';
    mlResponse.data.on('data', (chunk) => {
      const text = chunk.toString();
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ token: text, done: false })}\n\n`);
    });

    mlResponse.data.on('end', async () => {
      await ChatHistory.findOneAndUpdate(
        { studentId: req.user._id },
        { $push: { messages: { role: 'assistant', content: fullResponse, timestamp: new Date() } }, updatedAt: new Date() }
      );
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    mlResponse.data.on('error', () => {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted', done: true })}\n\n`);
      res.end();
    });
  } catch (err) {
    // Fallback: non-streaming response
    try {
      const student = await Student.findById(req.user._id);
      const fallback = `Hey ${student?.name || 'there'}! Saarthi streaming isn't available right now. Try the regular chat instead! 💬`;
      res.write(`data: ${JSON.stringify({ token: fallback, done: false })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch { res.write(`data: ${JSON.stringify({ error: 'Saarthi thodi der baad milega 😅', done: true })}\n\n`); }
    res.end();
  }
});

// ═══════ NEW: CHAT HISTORY ═══════
router.get('/history', async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ studentId: req.user._id });
    res.json({ messages: history?.messages || [] });
  } catch (err) { res.status(500).json({ error: 'Could not fetch history' }); }
});

router.delete('/history', async (req, res) => {
  await ChatHistory.findOneAndUpdate({ studentId: req.user._id }, { messages: [], updatedAt: new Date() });
  res.json({ success: true });
});

// ═══════ EXISTING: quick-insight ═══════
router.post('/quick-insight', async (req, res) => {
  try {
    const { generateInsights } = require('../services/insightEngine');
    const insights = await generateInsights(req.user._id);
    res.json(insights[0] || { type: 'info', icon: '🌱', message: 'Keep going! Every step counts.', color: 'accent2' });
  } catch (e) { res.status(500).json({ error: 'Failed to generate insight.' }); }
});

// ═══════ EXISTING: weekly-briefing ═══════
router.post('/weekly-briefing', async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    try {
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/saarthi/chat`, {
        message: `Generate a weekly briefing summary for ${student.name}, Sem ${student.semester}, CGPA ${student.cgpa}, ${student.branch} branch, career goal: ${student.careerGoal}. Include 3 action items for this week.`,
        history: [], studentContext: { name: student.name, semester: student.semester, cgpa: student.cgpa }
      });
      res.json(mlRes.data);
    } catch {
      res.json({ response: `📋 Weekly Briefing for ${student.name || 'Student'}\n\n1. Focus on your weakest subject this week\n2. Solve 5 DSA problems\n3. Update your skill progress on NEEV\n\nConsistency > Intensity. Keep building! 🌱`, source: 'fallback' });
    }
  } catch (e) { res.status(500).json({ error: 'Failed to generate briefing.' }); }
});

module.exports = router;
