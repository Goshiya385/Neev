const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { generateRoadmap, getProgressComparison } = require('../services/roadmapEngine');
const RoadmapProgress = require('../models/RoadmapProgress');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

router.get('/', async (req, res) => {
  try { const roadmap = await generateRoadmap(req.user._id); res.json(roadmap); }
  catch (e) { res.status(500).json({ error: 'Failed to get roadmap.' }); }
});

router.get('/progress', async (req, res) => {
  try { const progress = await getProgressComparison(req.user._id); res.json(progress); }
  catch (e) { res.status(500).json({ error: 'Failed to get progress.' }); }
});

router.put('/milestone/:id', async (req, res) => {
  try {
    const roadmap = await RoadmapProgress.findOne({ studentId: req.user._id, semester: req.user.semester });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found.' });
    const milestone = roadmap.milestones.id(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });
    milestone.completed = true;
    milestone.completedAt = new Date();
    await roadmap.save();
    res.json(roadmap);
  } catch (e) { res.status(500).json({ error: 'Failed to update milestone.' }); }
});

router.post('/regenerate', async (req, res) => {
  try {
    await RoadmapProgress.findOneAndDelete({ studentId: req.user._id, semester: req.user.semester });
    const roadmap = await generateRoadmap(req.user._id);
    res.json(roadmap);
  } catch (e) { res.status(500).json({ error: 'Failed to regenerate roadmap.' }); }
});

module.exports = router;
