const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const axios = require('axios');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

router.post('/marks', async (req, res) => {
  try {
    const { semester, subject, subjectCode, internalMarks, practicalMarks, externalMarks, maxInternal, maxPractical, maxExternal, examType, examDate } = req.body;
    let mark = await Marks.findOne({ studentId: req.user._id, semester, subject, examType });
    if (mark) {
      Object.assign(mark, { internalMarks, practicalMarks, externalMarks, maxInternal, maxPractical, maxExternal, examDate });
      await mark.save();
    } else {
      mark = new Marks({ studentId: req.user._id, semester, subject, subjectCode, internalMarks: internalMarks||0, practicalMarks: practicalMarks||0, externalMarks: externalMarks||0, maxInternal, maxPractical, maxExternal, examType, examDate });
      await mark.save();
    }
    await recomputeCGPA(req.user._id);
    res.json(mark);
  } catch (error) { res.status(500).json({ error: 'Failed to save marks.' }); }
});

router.get('/marks', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user._id }).sort({ semester: 1, subject: 1 });
    res.json(marks);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch marks.' }); }
});

router.get('/marks/semester/:sem', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user._id, semester: parseInt(req.params.sem) });
    res.json(marks);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch semester marks.' }); }
});

router.post('/attendance', async (req, res) => {
  try {
    const { subject, date, status, semester } = req.body;
    const att = new Attendance({ studentId: req.user._id, subject, date, status, semester: semester || req.user.semester });
    await att.save();
    res.json(att);
  } catch (error) { res.status(500).json({ error: 'Failed to save attendance.' }); }
});

router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user._id }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    const heatmap = {};
    records.forEach(r => {
      const d = r.date.toISOString().split('T')[0];
      if (!heatmap[d]) heatmap[d] = { present: 0, absent: 0, late: 0, total: 0 };
      heatmap[d][r.status]++;
      heatmap[d].total++;
    });
    res.json({ summary: { total, present, late, absent, percentage }, heatmap: Object.entries(heatmap).map(([date, data]) => ({ date, ...data })), records });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch attendance.' }); }
});

router.get('/analytics', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user._id });
    const attendance = await Attendance.find({ studentId: req.user._id });
    const subjectMap = {};
    marks.forEach(m => {
      if (!subjectMap[m.subject]) subjectMap[m.subject] = { total: 0, max: 0 };
      subjectMap[m.subject].total += m.internalMarks + m.externalMarks + m.practicalMarks;
      subjectMap[m.subject].max += m.maxInternal + m.maxExternal + m.maxPractical;
    });
    const subjectAverages = Object.entries(subjectMap).map(([subject, data]) => ({ subject, percentage: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0 })).sort((a, b) => b.percentage - a.percentage);
    const semGroups = {};
    marks.forEach(m => { if (!semGroups[m.semester]) semGroups[m.semester] = []; semGroups[m.semester].push(m); });
    const cgpaTrend = Object.keys(semGroups).sort().map(sem => {
      const sm = semGroups[sem];
      const t = sm.reduce((s, m) => s + m.internalMarks + m.externalMarks + m.practicalMarks, 0);
      const mx = sm.reduce((s, m) => s + m.maxInternal + m.maxExternal + m.maxPractical, 0);
      return { semester: parseInt(sem), sgpa: mx > 0 ? parseFloat(((t / mx) * 10).toFixed(2)) : 0 };
    });
    const weakAreas = subjectAverages.filter(s => s.percentage < 50);
    const totalAtt = attendance.length;
    const presentAtt = attendance.filter(a => a.status !== 'absent').length;
    const attendancePct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;
    res.json({ subjectAverages, cgpaTrend, weakAreas, attendancePct });
  } catch (error) { res.status(500).json({ error: 'Failed to generate analytics.' }); }
});

router.get('/patterns', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user._id });
    const attendance = await Attendance.find({ studentId: req.user._id });
    try {
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/patterns/detect`, { marks: marks.map(m => m.toObject()), attendance: attendance.map(a => a.toObject()) });
      res.json(mlRes.data);
    } catch {
      const subjectMap = {};
      marks.forEach(m => { if (!subjectMap[m.subject]) subjectMap[m.subject] = { total: 0, max: 0 }; subjectMap[m.subject].total += m.internalMarks + m.externalMarks + m.practicalMarks; subjectMap[m.subject].max += m.maxInternal + m.maxExternal + m.maxPractical; });
      const patterns = Object.entries(subjectMap).filter(([, d]) => d.max > 0 && (d.total / d.max) < 0.5).map(([subject, d]) => ({ type: 'weak_subject', subject, message: `${subject} at ${Math.round((d.total/d.max)*100)}%`, risk: (d.total/d.max) < 0.35 ? 'high' : 'moderate' }));
      res.json({ patterns, source: 'fallback' });
    }
  } catch (error) { res.status(500).json({ error: 'Failed to detect patterns.' }); }
});

async function recomputeCGPA(studentId) {
  const marks = await Marks.find({ studentId });
  if (!marks.length) return;
  const total = marks.reduce((s, m) => s + m.internalMarks + m.externalMarks + m.practicalMarks, 0);
  const max = marks.reduce((s, m) => s + m.maxInternal + m.maxExternal + m.maxPractical, 0);
  const cgpa = max > 0 ? parseFloat(((total / max) * 10).toFixed(2)) : 0;
  const subjectMap = {};
  marks.forEach(m => { const k = `${m.subject}-${m.semester}`; if (!subjectMap[k]) subjectMap[k] = { total: 0, max: 0 }; subjectMap[k].total += m.internalMarks + m.externalMarks + m.practicalMarks; subjectMap[k].max += m.maxInternal + m.maxExternal + m.maxPractical; });
  const backlogs = Object.values(subjectMap).filter(s => s.max > 0 && (s.total / s.max) < 0.4).length;
  await Student.findByIdAndUpdate(studentId, { cgpa, backlogs });
}

module.exports = router;
