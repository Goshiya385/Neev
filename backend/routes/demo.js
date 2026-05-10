const jwt = require('jsonwebtoken');
const {
  demoStudent, demoMarks, demoSkills, demoProjects,
  demoRoadmap, demoPlacement, demoInsights, demoDashboard,
  demoWeeklyTasks, demoTeacherDashboard
} = require('../config/demoData');

const JWT_SECRET = process.env.JWT_SECRET || 'neev_demo_secret';

const express = require('express');
const router = express.Router();

// ====== AUTH (matching frontend api.ts paths) ======
router.post('/auth/student/login', (req, res) => {
  const token = jwt.sign({ id: 'demo_student_001', role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: demoStudent, role: 'student', profileComplete: true });
});
router.post('/auth/teacher/login', (req, res) => {
  const token = jwt.sign({ id: 'demo_teacher_001', role: 'teacher' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token, role: 'teacher',
    user: { _id: 'demo_teacher_001', name: 'Prof. Mehta', email: 'mehta@neev.dev', department: 'CS' }
  });
});
router.post('/auth/student/register', (req, res) => {
  const token = jwt.sign({ id: 'demo_student_001', role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { ...demoStudent, name: req.body.name || 'New Student' }, role: 'student', profileComplete: false });
});
router.get('/auth/me', (req, res) => {
  res.json({ user: demoStudent, role: 'student' });
});

// ====== STUDENT ======
router.get('/students/profile', (req, res) => res.json(demoStudent));
router.put('/students/profile', (req, res) => res.json({ ...demoStudent, ...req.body }));
router.get('/students/dashboard', (req, res) => res.json(demoDashboard));
router.post('/students/onboarding', (req, res) => {
  res.json({ ...demoStudent, ...req.body, profileComplete: true });
});
router.get('/students/notifications', (req, res) => res.json(demoDashboard.notifications));
router.put('/students/notifications/:id/read', (req, res) => res.json({ message: 'Marked as read' }));

// ====== ACADEMICS ======
router.get('/academics/marks', (req, res) => res.json(demoMarks));
router.post('/academics/marks', (req, res) => res.json({ ...req.body, _id: 'new_mark_' + Date.now() }));
router.get('/academics/marks/semester/:sem', (req, res) => {
  const sem = parseInt(req.params.sem);
  res.json(demoMarks.filter(m => m.semester === sem));
});
router.post('/academics/attendance', (req, res) => res.json({ ...req.body, _id: 'att_' + Date.now() }));
router.get('/academics/attendance', (req, res) => {
  const attendance = demoMarks.slice(0, 5).map(m => ({
    subject: m.subject, totalClasses: 40, attended: 32 + Math.floor(Math.random() * 8),
    percentage: 80 + Math.floor(Math.random() * 15)
  }));
  res.json(attendance);
});
router.get('/academics/analytics', (req, res) => {
  res.json({
    sgpaHistory: demoDashboard.sgpaHistory,
    subjectWise: demoMarks,
    weakAreas: [
      { subject: 'Mathematics III', score: 63, risk: 'medium' },
      { subject: 'Discrete Maths', score: 67, risk: 'medium' },
    ],
    patterns: [
      { type: 'declining', subject: 'Mathematics', message: 'Math scores declining — needs attention', severity: 'high' },
      { type: 'strong', subject: 'Web Technologies', message: 'Consistently strong in practical subjects', severity: 'low' },
    ]
  });
});
router.get('/academics/patterns', (req, res) => {
  res.json([
    { type: 'declining', subject: 'Mathematics', message: 'Math scores declining — needs attention', severity: 'high' },
    { type: 'strong', subject: 'Web Technologies', message: 'Consistently strong in practical subjects', severity: 'low' },
  ]);
});

// ====== SKILLS ======
router.get('/skills', (req, res) => res.json(demoSkills));
router.post('/skills/log', (req, res) => res.json({ ...req.body, _id: 'skill_' + Date.now(), progress: 0 }));
router.put('/skills/:id', (req, res) => res.json({ ...req.body }));
router.get('/skills/summary', (req, res) => {
  const categories = {};
  demoSkills.forEach(s => {
    if (!categories[s.category]) categories[s.category] = { count: 0, avgProgress: 0, total: 0 };
    categories[s.category].count++;
    categories[s.category].total += s.progress;
    categories[s.category].avgProgress = Math.round(categories[s.category].total / categories[s.category].count);
  });
  res.json(categories);
});

// ====== ROADMAP ======
router.get('/roadmap', (req, res) => res.json(demoRoadmap));
router.get('/roadmap/progress', (req, res) => res.json({ overall: demoRoadmap.overallProgress, milestones: demoRoadmap.milestones }));
router.put('/roadmap/milestone/:id', (req, res) => {
  const m = demoRoadmap.milestones.find(m => m._id === req.params.id);
  res.json(m ? { ...m, ...req.body } : { error: 'Not found' });
});
router.post('/roadmap/regenerate', (req, res) => res.json(demoRoadmap));

// ====== PROJECTS ======
router.get('/projects', (req, res) => res.json(demoProjects));
router.post('/projects', (req, res) => res.json({ ...req.body, _id: 'proj_' + Date.now() }));
router.put('/projects/:id', (req, res) => res.json({ ...req.body }));
router.delete('/projects/:id', (req, res) => res.json({ message: 'Deleted' }));
router.post('/projects/:id/ai-resume-points', (req, res) => {
  res.json({ bullet: 'Engineered a scalable full-stack application using modern technologies, improving performance by 35%' });
});

// ====== PLANNER ======
router.get('/planner/current-week', (req, res) => res.json({ week: 14, tasks: demoWeeklyTasks }));
router.post('/planner/task', (req, res) => res.json({ ...req.body, _id: 'task_' + Date.now(), completed: false }));
router.put('/planner/task/:id/complete', (req, res) => res.json({ completed: true }));
router.get('/planner/streak', (req, res) => res.json(demoStudent.streak));
router.get('/planner/heatmap', (req, res) => {
  const heatmap = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    heatmap.push({ date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 5) });
  }
  res.json(heatmap);
});

// ====== PLACEMENT ======
router.get('/placement/score', (req, res) => res.json(demoPlacement));
router.get('/placement/company/:company', (req, res) => {
  res.json({ name: req.params.company, requirements: ['Aptitude', 'Coding', 'Communication'], difficulty: 'Medium', topics: ['Arrays', 'Strings', 'Trees'] });
});
router.get('/placement/interview-meter', (req, res) => res.json(demoPlacement));
router.post('/placement/mock-test', (req, res) => res.json({ ...req.body, _id: 'mt_' + Date.now() }));
router.get('/placement/mock-history', (req, res) => {
  res.json([
    { _id: 'mt1', testType: 'aptitude', score: 72, maxScore: 100, date: new Date() },
    { _id: 'mt2', testType: 'coding', score: 65, maxScore: 100, date: new Date() },
  ]);
});

// ====== SAARTHI AI ======
router.post('/saarthi/chat', (req, res) => {
  const replies = [
    "Bhai, tera CGPA 7.8 hai — solid base hai! But Full Stack goal ke liye Docker aur CI/CD bhi seekh le this sem. 🔥",
    "Dekh, tera DSA 60% pe hai. Placement season se pehle 80% tak le ja. Daily 2 problems solve kar — consistency is key! 💪",
    "Mathematics mein thoda weak dikh raha hai. Khan Academy + practice sets try kar. Conceptual clarity aaegi. 🧠",
    "Tera project game strong hai bro! E-Commerce + AI Chatbot — resume mein killer combo hoga. Keep building! 🚀",
    "Streak 12 days ka chal raha hai — don't break it! Ek baar 21 days ka streak bana le, habit ban jaegi. ⚡",
  ];
  res.json({ role: 'assistant', content: replies[Math.floor(Math.random() * replies.length)] });
});
router.post('/saarthi/quick-insight', (req, res) => {
  res.json({ insight: demoInsights[Math.floor(Math.random() * demoInsights.length)] });
});
router.post('/saarthi/weekly-briefing', (req, res) => {
  res.json({ briefing: 'This week: Focus on DSA (Trees + Graphs). Your OS assignment is due Friday. Maintain your 12-day streak! 💪' });
});

// ====== REPORTS ======
router.get('/reports/semester/:sem', (req, res) => {
  res.json({
    semester: parseInt(req.params.sem), sgpa: 7.8, totalSubjects: 5,
    topSubject: { name: 'Web Technologies', score: 95 },
    weakSubject: { name: 'Mathematics III', score: 63 },
    skillsLearned: 4, projectsBuilt: 2, roadmapProgress: 62, streakDays: 12, placementScore: 58,
    highlights: ['🏆 Top scorer in Web Technologies', '📈 CGPA improved by 0.3', '🔥 12-day coding streak'],
    areas_to_improve: ['📐 Mathematics needs practice', '🎯 Aptitude below 50%', '🗣️ Communication workshops']
  });
});
router.get('/reports/wrapped', (req, res) => {
  res.json({
    totalDaysActive: 87, topSkill: 'JavaScript', projectsCompleted: 2,
    longestStreak: 21, totalCommits: 156, improvement: '+0.6 CGPA'
  });
});

// ====== TEACHER ======
router.get('/teacher/dashboard', (req, res) => res.json(demoTeacherDashboard));
router.get('/teacher/students', (req, res) => {
  const students = Array.from({ length: 10 }, (_, i) => ({
    _id: `student_${i}`, rollNumber: `NEEV2024${String(i + 1).padStart(3, '0')}`,
    name: ['Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Gupta', 'Vikram Singh',
           'Ananya Reddy', 'Karthik Nair', 'Isha Verma', 'Rohan Joshi', 'Meera Das'][i],
    branch: 'CS', semester: 4, cgpa: +(6.5 + Math.random() * 2.5).toFixed(1),
    streak: { current: Math.floor(Math.random() * 20) },
    riskLevel: ['low', 'low', 'medium', 'low', 'high', 'low', 'medium', 'low', 'low', 'high'][i],
  }));
  res.json(students);
});
router.get('/teacher/students/:id', (req, res) => {
  res.json({ student: { ...demoStudent, _id: req.params.id }, marks: demoMarks, skills: demoSkills, projects: demoProjects, placementScore: demoPlacement, roadmap: demoRoadmap });
});
router.get('/teacher/risk-alerts', (req, res) => {
  res.json([
    { studentName: 'Vikram Singh', rollNumber: 'NEEV2024005', type: 'academic', message: 'CGPA below 6.5', severity: 'high' },
    { studentName: 'Meera Das', rollNumber: 'NEEV2024010', type: 'attendance', message: 'Attendance below 75%', severity: 'high' },
    { studentName: 'Rahul Kumar', rollNumber: 'NEEV2024003', type: 'skills', message: 'No skill progress in 2 weeks', severity: 'medium' },
  ]);
});
router.post('/teacher/students/:id/notify', (req, res) => res.json({ message: 'Notification sent' }));
router.put('/teacher/students/:id/tc', (req, res) => res.json({ message: 'TC marked' }));

module.exports = router;
