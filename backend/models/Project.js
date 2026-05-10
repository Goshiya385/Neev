const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  techStack: [String],
  githubUrl: { type: String, trim: true },
  liveUrl: { type: String, trim: true },
  semester: { type: Number, min: 1, max: 6 },
  status: { type: String, enum: ['idea', 'in-progress', 'completed'], default: 'idea' },
  aiResumePoints: [String],
}, {
  timestamps: true
});

projectSchema.index({ studentId: 1 });

module.exports = mongoose.model('Project', projectSchema);
