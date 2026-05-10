const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const SkillProgress = require('../models/SkillProgress');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');
const { calculatePlacementScore } = require('../services/placementScore');

const router = express.Router();

router.use(auth);
router.use(roleCheck('teacher', 'admin'));

// GET /api/teacher/dashboard — batch overview
router.get('/dashboard', async (req, res) => {
  try {
    const teacher = req.user;
    const students = await Student.find({
      _id: { $in: teacher.assignedStudents },
      isTC: false,
    });

    const totalStudents = students.length;
    const avgCGPA = totalStudents > 0
      ? parseFloat((students.reduce((s, st) => s + (st.cgpa || 0), 0) / totalStudents).toFixed(2))
      : 0;
    const avgPlacement = totalStudents > 0
      ? Math.round(students.reduce((s, st) => s + (st.placementReadiness || 0), 0) / totalStudents)
      : 0;

    // Risk categorization
    const highRisk = students.filter(s => s.cgpa < 5 || s.backlogs > 2);
    const moderateRisk = students.filter(s => s.cgpa >= 5 && s.cgpa < 7 && s.backlogs <= 2);
    const stable = students.filter(s => s.cgpa >= 7 && s.backlogs === 0);

    // Branch distribution
    const branchDist = {};
    students.forEach(s => {
      branchDist[s.branch] = (branchDist[s.branch] || 0) + 1;
    });

    // Semester distribution
    const semDist = {};
    students.forEach(s => {
      semDist[s.semester] = (semDist[s.semester] || 0) + 1;
    });

    res.json({
      totalStudents,
      avgCGPA,
      avgPlacement,
      riskBreakdown: {
        high: highRisk.length,
        moderate: moderateRisk.length,
        stable: stable.length,
      },
      branchDistribution: branchDist,
      semesterDistribution: semDist,
      highRiskStudents: highRisk.map(s => ({ _id: s._id, name: s.name, rollNumber: s.rollNumber, cgpa: s.cgpa, backlogs: s.backlogs })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teacher dashboard.' });
  }
});

// GET /api/teacher/students — all assigned students
router.get('/students', async (req, res) => {
  try {
    const { branch, semester, risk, search } = req.query;
    const filter = {
      _id: { $in: req.user.assignedStudents },
      isTC: false,
    };

    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    let students = await Student.find(filter).sort({ rollNumber: 1 });

    if (risk === 'high') students = students.filter(s => s.cgpa < 5 || s.backlogs > 2);
    if (risk === 'moderate') students = students.filter(s => s.cgpa >= 5 && s.cgpa < 7);
    if (risk === 'stable') students = students.filter(s => s.cgpa >= 7);

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// GET /api/teacher/students/:id — full student view
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const marks = await Marks.find({ studentId: student._id });
    const attendance = await Attendance.find({ studentId: student._id });
    const skills = await SkillProgress.find({ studentId: student._id });
    const projects = await Project.find({ studentId: student._id });
    const placement = await calculatePlacementScore(student._id);

    res.json({
      student: student.toJSON(),
      marks,
      attendance,
      skills,
      projects,
      placementBreakdown: placement,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student details.' });
  }
});

// PUT /api/teacher/students/:id/tc — mark student as TC
router.put('/students/:id/tc', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isTC: true },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student marked as TC.', student });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark TC.' });
  }
});

// PUT /api/teacher/students/:id/transfer — transfer student
router.put('/students/:id/transfer', async (req, res) => {
  try {
    const { newTeacherId } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { assignedTeacher: newTeacherId },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student transferred.', student });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer student.' });
  }
});

// POST /api/teacher/students/:id/notify — send notification
router.post('/students/:id/notify', async (req, res) => {
  try {
    const { message, type } = req.body;
    const notification = await createNotification(req.params.id, 'student', message, type || 'info');
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

// GET /api/teacher/risk-alerts
router.get('/risk-alerts', async (req, res) => {
  try {
    const students = await Student.find({
      _id: { $in: req.user.assignedStudents },
      isTC: false,
      $or: [
        { cgpa: { $lt: 5 } },
        { backlogs: { $gt: 0 } },
        { placementReadiness: { $lt: 30 } },
      ],
    }).sort({ cgpa: 1 });

    res.json(students.map(s => ({
      _id: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      cgpa: s.cgpa,
      backlogs: s.backlogs,
      placementReadiness: s.placementReadiness,
      semester: s.semester,
      riskLevel: s.cgpa < 5 || s.backlogs > 2 ? 'high' : 'moderate',
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk alerts.' });
  }
});

module.exports = router;
