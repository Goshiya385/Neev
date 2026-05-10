const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { generateSemesterReport } = require('../services/reportBuilder');
const { sendWeeklyStudentReport, sendTeacherDigest } = require('../services/emailService');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const SkillProgress = require('../models/SkillProgress');
const WeeklyTask = require('../models/WeeklyTask');
const axios = require('axios');
const router = express.Router();

// ═══════ EXISTING: authenticated report routes ═══════
router.get('/semester/:sem', auth, roleCheck('student'), async (req, res) => {
  try { res.json(await generateSemesterReport(req.user._id, parseInt(req.params.sem))); }
  catch (e) { res.status(500).json({ error: 'Failed to generate report.' }); }
});

router.get('/wrapped', auth, roleCheck('student'), async (req, res) => {
  try { res.json(await generateSemesterReport(req.user._id, req.user.semester)); }
  catch (e) { res.status(500).json({ error: 'Failed to generate wrapped report.' }); }
});

// ═══════ NEW: Weekly Report Trigger (called by n8n webhook) ═══════
router.post('/weekly-trigger', async (req, res) => {
  // Verify n8n secret
  if (req.headers['x-n8n-secret'] !== process.env.N8N_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const students = await Student.find({});
    const results = { success: [], failed: [] };

    for (const student of students) {
      try {
        const marks = await Marks.find({ studentId: student._id });
        const attendance = await Attendance.find({ studentId: student._id });
        const skills = await SkillProgress.find({ studentId: student._id });
        const weekNum = getCurrentWeekNumber();
        const tasks = await WeeklyTask.findOne({ studentId: student._id, weekNumber: weekNum });

        // Compute stats
        const avgMarks = marks.length ? Math.round(marks.reduce((a, m) => a + ((m.internalMarks || 0) + (m.externalMarks || 0)) / ((m.maxInternal || 30) + (m.maxExternal || 70)) * 100, 0) / marks.length) : 0;
        const attendancePct = attendance.length ? Math.round(attendance.reduce((a, at) => a + (at.attended / (at.totalClasses || 1) * 100), 0) / attendance.length) : 75;
        const completedTasks = tasks?.tasks?.filter(t => t.completed)?.length || 0;

        // Subject analysis
        const subScores = {};
        marks.forEach(m => {
          const pct = ((m.internalMarks || 0) + (m.externalMarks || 0)) / ((m.maxInternal || 30) + (m.maxExternal || 70)) * 100;
          subScores[m.subject] = (subScores[m.subject] || []).concat(pct);
        });
        const subAvgs = Object.entries(subScores).map(([sub, scores]) => ({ sub, avg: scores.reduce((a, b) => a + b, 0) / scores.length }));
        const topSubject = subAvgs.sort((a, b) => b.avg - a.avg)[0]?.sub || 'N/A';
        const weakSubject = subAvgs.sort((a, b) => a.avg - b.avg)[0]?.sub || 'N/A';

        // ML prediction
        let prediction = { predicted_cgpa: student.cgpa, trend: 'stable' };
        try {
          const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/predict/cgpa`, {
            data: { cgpa: student.cgpa, attendance: attendancePct, semester: student.semester, backlogs: student.backlogs || 0 }
          });
          prediction = mlRes.data;
        } catch {}

        // AI Summary (fallback if Groq fails)
        let aiSummary = `Great work this week! Your CGPA is ${student.cgpa}, attendance is ${attendancePct}%. Keep pushing on ${weakSubject}!`;
        try {
          const Groq = require('groq-sdk');
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const summaryRes = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', max_tokens: 150,
            messages: [{ role: 'user', content: `Generate a brief weekly insight for ${student.name}. CGPA ${student.cgpa}, Attendance ${attendancePct}%, Streak ${student.currentStreak || 0} days, ${completedTasks} tasks done, Top: ${topSubject}, Weak: ${weakSubject}. Write in Hinglish, supportive, max 80 words.` }]
          });
          aiSummary = summaryRes.choices[0].message.content;
        } catch {}

        // Send email
        if (student.email) {
          await sendWeeklyStudentReport(student, { aiSummary, cgpa: student.cgpa, attendancePct, streak: student.currentStreak || 0, completedTasks, prediction, topSubject, weakSubject });
          results.success.push(student.email);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) { results.failed.push({ email: student.email || student.name, error: err.message }); }
    }

    // Teacher digests
    try {
      const teachers = await Teacher.find({});
      for (const teacher of teachers) {
        const allStudents = await Student.find({});
        const atRisk = allStudents.filter(s => (s.cgpa || 10) < 5.5 || (s.backlogs || 0) > 1);
        const avgCgpa = allStudents.length ? (allStudents.reduce((a, s) => a + (s.cgpa || 0), 0) / allStudents.length).toFixed(1) : 0;
        if (teacher.email) {
          await sendTeacherDigest(teacher, {
            totalStudents: allStudents.length,
            atRisk: atRisk.map(s => ({ name: s.name, cgpa: s.cgpa, risk_level: (s.cgpa || 10) < 5 ? 'high' : 'moderate' })),
            avgCgpa, avgAttendance: 74
          });
        }
      }
    } catch {}

    res.json({ message: 'Weekly reports processed', ...results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
}

module.exports = router;
