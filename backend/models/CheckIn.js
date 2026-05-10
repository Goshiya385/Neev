const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  studyHours: { type: Number, default: 0 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'stressed', 'low'], default: 'okay' },
  workedOn: { type: String, trim: true },
  productivity: { type: Number, min: 1, max: 5, default: 3 },
  goals: { type: String, trim: true }, // What they plan to do tomorrow
  reflection: { type: String, trim: true }, // How was the day
}, {
  timestamps: true
});

// One check-in per student per day
checkInSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
