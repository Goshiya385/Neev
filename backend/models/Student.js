const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  branch: { type: String, enum: ['CS', 'IT', 'AI', 'ML', 'ECE', 'EE', 'ME', 'CE'] },
  semester: { type: Number, min: 1, max: 6, default: 1 },
  college: { type: String, trim: true },

  careerGoal: {
    type: String,
    enum: [
      'Web Development', 'Full Stack', 'AI/ML', 'Data Science',
      'Cybersecurity', 'UI/UX', 'Government Job', 'Startup',
      'Higher Studies', 'Freelancing', 'Research', 'Not Decided'
    ],
    default: 'Not Decided'
  },

  cgpa: { type: Number, default: 0 },
  backlogs: { type: Number, default: 0 },
  placementReadiness: { type: Number, default: 0 },
  profileComplete: { type: Boolean, default: false },

  techProfile: {
    languages: [String],
    frameworks: [String],
    tools: [String],
    githubUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
  },

  softSkills: {
    englishFluency: { type: Number, min: 1, max: 10 },
    communicationConfidence: { type: Number, min: 1, max: 10 },
    aptitudeLevel: { type: Number, min: 1, max: 10 },
    interviewConfidence: { type: Number, min: 1, max: 10 },
  },

  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: Date,

  isTC: { type: Boolean, default: false },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
}, {
  timestamps: true
});

// Hash password before save
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
