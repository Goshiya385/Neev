const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/student/login
router.post('/student/login', async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ error: 'Roll number and password are required.' });
    }

    const student = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (!student) {
      return res.status(401).json({ error: 'Invalid roll number or password.' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid roll number or password.' });
    }

    const token = generateToken(student._id, 'student');

    res.json({
      token,
      user: student.toJSON(),
      role: 'student',
      profileComplete: student.profileComplete,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/teacher/login
router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase() });
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(teacher._id, teacher.role);

    res.json({
      token,
      user: teacher.toJSON(),
      role: teacher.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/student/register (admin only or open registration)
router.post('/student/register', async (req, res) => {
  try {
    const { rollNumber, password, name, email, branch, semester, college } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ error: 'Roll number and password are required.' });
    }

    const existing = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Student with this roll number already exists.' });
    }

    const student = new Student({
      rollNumber: rollNumber.toUpperCase(),
      password,
      name,
      email,
      branch,
      semester: semester || 1,
      college,
    });

    await student.save();

    const token = generateToken(student._id, 'student');

    res.status(201).json({
      token,
      user: student.toJSON(),
      role: 'student',
      profileComplete: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Roll number already exists.' });
    }
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/logout (client-side token removal, this is just for acknowledgement)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me — get current user from token
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON(),
      role: req.userType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
