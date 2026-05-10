const mongoose = require('mongoose')
const FeedbackSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorType: { type: String, enum: ['student', 'teacher'], required: true },
  targetType: { type: String, enum: ['platform', 'course', 'teacher', 'saarthi', 'general'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  isAnonymous: { type: Boolean, default: false },
  content: { type: String, required: true, minlength: 10, maxlength: 1000 },
  rating: { type: Number, min: 1, max: 5 },
  sentiment: {
    label: { type: String, enum: ['positive', 'negative', 'neutral', 'mixed'] },
    score: Number,
    emotion: { type: String, enum: ['happy', 'frustrated', 'anxious', 'motivated', 'confused', 'satisfied', 'disappointed', 'neutral'] },
    keywords: [String],
    summary: String,
  },
  status: { type: String, enum: ['pending', 'analyzed', 'reviewed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Feedback', FeedbackSchema)
