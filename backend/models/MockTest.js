const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testType: {
    type: String,
    enum: ['aptitude', 'coding', 'core-subject', 'hr', 'mock-interview'],
    required: true
  },
  subject: { type: String, trim: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  timeTaken: { type: Number }, // minutes
  weakTopics: [String],
  accuracy: { type: Number },
}, {
  timestamps: true
});

mockTestSchema.index({ studentId: 1, testType: 1 });

module.exports = mongoose.model('MockTest', mockTestSchema);
