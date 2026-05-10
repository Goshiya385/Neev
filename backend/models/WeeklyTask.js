const mongoose = require('mongoose');

const microTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['DSA', 'English', 'Project', 'Aptitude', 'Skills', 'Other'] },
  microTasks: [microTaskSchema],
  completed: { type: Boolean, default: false },
  dueDate: Date,
}, { _id: true });

const weeklyTaskSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  tasks: [taskSchema],
}, {
  timestamps: true
});

weeklyTaskSchema.index({ studentId: 1, weekNumber: 1, year: 1 });

module.exports = mongoose.model('WeeklyTask', weeklyTaskSchema);
