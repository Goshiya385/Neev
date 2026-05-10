const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  semester: { type: Number, min: 1, max: 6 },
}, {
  timestamps: true
});

attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, semester: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
