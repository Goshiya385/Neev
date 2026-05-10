const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const axios = require('axios');

// POST /api/feedback — submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { content, targetType, targetId, isAnonymous, rating } = req.body;
    if (!content || content.length < 10) return res.status(400).json({ error: 'Feedback must be at least 10 characters' });

    const feedback = new Feedback({
      authorId: req.user._id, authorType: req.userType || 'student',
      targetType: targetType || 'general', targetId, isAnonymous, content, rating, status: 'pending'
    });
    await feedback.save();

    // Async sentiment analysis
    analyzeSentimentAsync(feedback._id, content, targetType || 'general', rating);

    res.json({ success: true, message: 'Feedback submitted! Analyzing sentiment...', feedbackId: feedback._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function analyzeSentimentAsync(feedbackId, content, targetType, rating) {
  try {
    const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/sentiment/analyze`, { content, target_type: targetType, rating });
    const sentiment = mlRes.data;
    await Feedback.findByIdAndUpdate(feedbackId, {
      sentiment: { label: sentiment.label, score: sentiment.score, emotion: sentiment.emotion, keywords: sentiment.keywords, summary: sentiment.summary },
      status: 'analyzed'
    });
  } catch (err) { console.error('Sentiment analysis failed for feedback:', feedbackId, err.message); }
}

// GET /api/feedback/my — student's own feedbacks
router.get('/my', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ authorId: req.user._id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/feedback/dashboard — teacher sentiment dashboard
router.get('/dashboard', auth, roleCheck(['teacher', 'admin']), async (req, res) => {
  try {
    const { targetType, days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const query = { createdAt: { $gte: since }, status: 'analyzed' };
    if (targetType) query.targetType = targetType;

    const feedbacks = await Feedback.find(query).select('-authorId');

    // Try ML aggregate, fallback to local
    let analytics = { total: feedbacks.length, sentiment_distribution: {}, avg_rating: 0, top_keywords: [], emotion_distribution: {}, overall_health: 'neutral' };
    try {
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/sentiment/aggregate`, {
        feedbacks: feedbacks.map(f => ({ sentiment: f.sentiment, rating: f.rating, targetType: f.targetType }))
      });
      analytics = mlRes.data;
    } catch {}

    res.json({
      feedbacks: feedbacks.map(f => ({
        id: f._id, content: f.isAnonymous ? '[Anonymous]' : f.content,
        targetType: f.targetType, sentiment: f.sentiment, rating: f.rating, createdAt: f.createdAt
      })),
      analytics
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/feedback/recent
router.get('/recent', auth, roleCheck(['teacher', 'admin']), async (req, res) => {
  const feedbacks = await Feedback.find({ status: 'analyzed' }).sort({ createdAt: -1 }).limit(20).select('-authorId');
  res.json(feedbacks);
});

module.exports = router;
