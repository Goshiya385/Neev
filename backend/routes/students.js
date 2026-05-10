const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const axios = require('axios');
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const SkillProgress = require('../models/SkillProgress');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { generateInsights } = require('../services/insightEngine');
const { calculatePlacementScore } = require('../services/placementScore');

const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

// GET /api/students/profile
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate('assignedTeacher', 'name email');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/students/profile
router.put('/profile', async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'branch', 'semester', 'college', 'careerGoal', 'techProfile', 'softSkills'];
    const updates = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const student = await Student.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/students/onboarding
router.post('/onboarding', async (req, res) => {
  try {
    const { name, email, phone, branch, semester, college, careerGoal, techProfile, softSkills } = req.body;
    const student = await Student.findByIdAndUpdate(req.user._id,
      { name, email, phone, branch, semester, college, careerGoal, techProfile, softSkills, profileComplete: true },
      { new: true, runValidators: true }
    );
    indexStudentRAG(req.user._id); // Index into RAG on onboarding
    res.json({ message: 'Onboarding complete!', student });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

// GET /api/students/dashboard — AI-enhanced dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    // CGPA trend per semester
    const allMarks = await Marks.find({ studentId });
    const semesterGroups = {};
    allMarks.forEach(m => {
      if (!semesterGroups[m.semester]) semesterGroups[m.semester] = [];
      semesterGroups[m.semester].push(m);
    });

    const cgpaTrend = Object.keys(semesterGroups).sort().map(sem => {
      const semMarks = semesterGroups[sem];
      const total = semMarks.reduce((s, m) => s + m.internalMarks + m.externalMarks + m.practicalMarks, 0);
      const max = semMarks.reduce((s, m) => s + m.maxInternal + m.maxExternal + m.maxPractical, 0);
      const sgpa = max > 0 ? parseFloat(((total / max) * 10).toFixed(2)) : 0;
      return { semester: parseInt(sem), sgpa };
    });

    // Local insights
    const insights = await generateInsights(studentId);
    const placementBreakdown = await calculatePlacementScore(studentId);
    const notifications = await Notification.find({ userId: studentId, read: false }).sort({ createdAt: -1 }).limit(5);

    // ── AI-Powered Enhancements ──
    let aiInsights = null, linearTrend = null;

    try {
      // Linear Regression trend
      if (cgpaTrend.length >= 2) {
        const trendRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/predict/trend`, {
          data: { semester_data: cgpaTrend, current_semester: student.semester }
        });
        linearTrend = trendRes.data;
      }

      // AI insights
      const insightRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/insights/generate`, {
        data: {
          student: { name: student.name, cgpa: student.cgpa, semester: student.semester, branch: student.branch,
                     careerGoal: student.careerGoal, backlogs: student.backlogs || 0, currentStreak: student.currentStreak || 0,
                     placementReadiness: student.placementReadiness || 0 },
          predictions: linearTrend || {}
        }
      });
      aiInsights = insightRes.data;
    } catch {}

    // Async RAG indexing (best-effort, don't wait)
    indexStudentRAG(studentId);

    res.json({
      student: student.toJSON(), cgpaTrend, insights, aiInsights, linearTrend,
      placementBreakdown, notifications,
      streaks: { current: student.currentStreak, longest: student.longestStreak },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

// GET /api/students/ai-insights — dedicated AI insights
router.get('/ai-insights', async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const marks = await Marks.find({ studentId: req.user._id });
    const skills = await SkillProgress.find({ studentId: req.user._id });

    // ML prediction
    let prediction = {};
    try {
      const predRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/predict/cgpa`, {
        data: { marks: marks.map(m => ({ subject: m.subject, internal: m.internalMarks, external: m.externalMarks,
                 practical: m.practicalMarks, maxInternal: m.maxInternal, maxExternal: m.maxExternal, maxPractical: m.maxPractical })),
                currentCGPA: student.cgpa, semester: student.semester, backlogs: student.backlogs || 0 }
      });
      prediction = predRes.data;
    } catch {}

    // AI insights with ML context
    const insightRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/insights/generate`, {
      data: {
        student: { name: student.name, cgpa: student.cgpa, semester: student.semester, branch: student.branch,
                   careerGoal: student.careerGoal, backlogs: student.backlogs || 0, currentStreak: student.currentStreak || 0,
                   placementReadiness: student.placementReadiness || 0,
                   skillCount: skills.length, avgSkillCompletion: skills.length ? Math.round(skills.reduce((a, s) => a + s.completionPercent, 0) / skills.length) : 0 },
        predictions: prediction
      }
    });

    // Comparative insight
    let comparative = null;
    try {
      const allStudents = await Student.find({});
      const avgCgpa = allStudents.length ? parseFloat((allStudents.reduce((a, s) => a + (s.cgpa || 0), 0) / allStudents.length).toFixed(1)) : 6.5;
      const compRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/insights/compare`, {
        data: { student: { cgpa: student.cgpa, attendancePct: 75 }, class_avg: { avgCgpa, avgAttendance: 74 } }
      });
      comparative = compRes.data;
    } catch {}

    res.json({ ...insightRes.data, prediction, comparative });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI insights', detail: err.message });
  }
});

// GET /api/students/trend — linear regression CGPA trend
router.get('/trend', async (req, res) => {
  try {
    const allMarks = await Marks.find({ studentId: req.user._id });
    const semesterGroups = {};
    allMarks.forEach(m => {
      if (!semesterGroups[m.semester]) semesterGroups[m.semester] = [];
      semesterGroups[m.semester].push(m);
    });

    const semester_data = Object.keys(semesterGroups).sort().map(sem => {
      const semMarks = semesterGroups[sem];
      const total = semMarks.reduce((s, m) => s + m.internalMarks + m.externalMarks + m.practicalMarks, 0);
      const max = semMarks.reduce((s, m) => s + m.maxInternal + m.maxExternal + m.maxPractical, 0);
      return { semester: parseInt(sem), sgpa: max > 0 ? parseFloat(((total / max) * 10).toFixed(2)) : 0 };
    });

    const trendRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/predict/trend`, {
      data: { semester_data, current_semester: req.user.semester }
    });
    res.json(trendRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute trend', detail: err.message });
  }
});

// GET /api/students/notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/students/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, { read: true }, { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// ═══════ RAG INDEXING (async helper) ═══════
async function indexStudentRAG(studentId) {
  try {
    const student = await Student.findById(studentId);
    const marks = await Marks.find({ studentId });
    const skills = await SkillProgress.find({ studentId });
    const projects = await Project.find({ studentId });
    let attendance = [];
    try { const Att = require('../models/Attendance'); attendance = await Att.find({ studentId }); } catch {}

    await axios.post(`${process.env.ML_SERVICE_URL}/ml/rag/index`, {
      studentId: studentId.toString(),
      data: {
        name: student.name, semester: student.semester, branch: student.branch,
        cgpa: student.cgpa, careerGoal: student.careerGoal, backlogs: student.backlogs || 0,
        placementReadiness: student.placementReadiness || 0, currentStreak: student.currentStreak || 0,
        marks: marks.map(m => ({ subject: m.subject, semester: m.semester, internal: m.internalMarks, external: m.externalMarks,
                 practical: m.practicalMarks, maxInternal: m.maxInternal, maxExternal: m.maxExternal, maxPractical: m.maxPractical })),
        skills: skills.map(s => ({ name: s.skillName, completionPercent: s.completionPercent })),
        projects: projects.map(p => ({ title: p.title, description: p.description, techStack: p.techStack, status: p.status })),
        attendance: attendance.map(a => ({ subject: a.subject, totalClasses: a.totalClasses, attended: a.attended }))
      }
    });
  } catch (err) { /* RAG indexing is best-effort */ }
}

module.exports = router;
