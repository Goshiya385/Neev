const mongoose = require('mongoose');

const skillProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  category: {
    type: String,
    enum: ['language', 'cs-core', 'development', 'tools', 'future-tech'],
    required: true
  },
  skillName: { type: String, required: true, trim: true },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 },
  confidenceLevel: { type: Number, default: 0, min: 0, max: 5 },
  streak: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
});

skillProgressSchema.index({ studentId: 1, category: 1 });

module.exports = mongoose.model('SkillProgress', skillProgressSchema);
