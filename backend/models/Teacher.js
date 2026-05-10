const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, trim: true },
  department: { type: String, trim: true },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
}, {
  timestamps: true
});

teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

teacherSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

teacherSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Teacher', teacherSchema);
