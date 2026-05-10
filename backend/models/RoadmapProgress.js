const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['technical', 'aptitude', 'english', 'project', 'github', 'tools'] },
  expected: { type: Boolean, default: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  dueWeek: Number,
}, { _id: true });

const roadmapProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true, min: 1, max: 6 },
  milestones: [milestoneSchema],
  overallProgress: { type: Number, default: 0 },
}, {
  timestamps: true
});

roadmapProgressSchema.index({ studentId: 1, semester: 1 });

// Auto-compute overall progress
roadmapProgressSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completed = this.milestones.filter(m => m.completed).length;
    this.overallProgress = Math.round((completed / this.milestones.length) * 100);
  }
  next();
});

module.exports = mongoose.model('RoadmapProgress', roadmapProgressSchema);
