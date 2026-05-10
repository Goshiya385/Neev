const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.id);
      if (!student) return res.status(401).json({ error: 'Student not found.' });
      req.user = student;
      req.userType = 'student';
    } else if (decoded.role === 'teacher' || decoded.role === 'admin') {
      const teacher = await Teacher.findById(decoded.id);
      if (!teacher) return res.status(401).json({ error: 'Teacher not found.' });
      req.user = teacher;
      req.userType = decoded.role;
    } else {
      return res.status(401).json({ error: 'Invalid token role.' });
    }

    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
