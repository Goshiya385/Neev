const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['student', 'teacher'], required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['warning', 'reminder', 'achievement', 'alert', 'info'],
    default: 'info'
  },
  read: { type: Boolean, default: false },
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
