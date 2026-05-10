const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true, min: 1, max: 6 },
  subject: { type: String, required: true, trim: true },
  subjectCode: { type: String, trim: true },
  internalMarks: { type: Number, default: 0 },
  practicalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  maxInternal: { type: Number, default: 30 },
  maxPractical: { type: Number, default: 25 },
  maxExternal: { type: Number, default: 70 },
  examType: { type: String, enum: ['internal', 'external', 'practical', 'assignment'] },
  examDate: Date,
}, {
  timestamps: true
});

marksSchema.index({ studentId: 1, semester: 1 });
marksSchema.index({ studentId: 1, subject: 1, semester: 1 });

module.exports = mongoose.model('Marks', marksSchema);
