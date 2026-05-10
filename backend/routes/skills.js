const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const SkillProgress = require('../models/SkillProgress');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

router.get('/', async (req, res) => {
  try {
    const skills = await SkillProgress.find({ studentId: req.user._id }).sort({ category: 1 });
    res.json(skills);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch skills.' }); }
});

router.put('/:skillId', async (req, res) => {
  try {
    const { completionPercent, confidenceLevel } = req.body;
    const skill = await SkillProgress.findOneAndUpdate(
      { _id: req.params.skillId, studentId: req.user._id },
      { completionPercent, confidenceLevel, lastUpdated: new Date() },
      { new: true }
    );
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });
    res.json(skill);
  } catch (e) { res.status(500).json({ error: 'Failed to update skill.' }); }
});

router.post('/log', async (req, res) => {
  try {
    const { skillName, category, completionPercent, confidenceLevel } = req.body;
    let skill = await SkillProgress.findOne({ studentId: req.user._id, skillName, category });
    if (skill) {
      skill.completionPercent = completionPercent || skill.completionPercent;
      skill.confidenceLevel = confidenceLevel || skill.confidenceLevel;
      const lastDate = skill.lastUpdated;
      const now = new Date();
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      skill.streak = diffDays <= 1 ? skill.streak + 1 : 1;
      skill.lastUpdated = now;
      await skill.save();
    } else {
      skill = new SkillProgress({ studentId: req.user._id, category, skillName, completionPercent: completionPercent || 0, confidenceLevel: confidenceLevel || 1, streak: 1, lastUpdated: new Date() });
      await skill.save();
    }
    res.json(skill);
  } catch (e) { res.status(500).json({ error: 'Failed to log skill.' }); }
});

router.get('/summary', async (req, res) => {
  try {
    const skills = await SkillProgress.find({ studentId: req.user._id });
    const categories = {};
    skills.forEach(s => {
      if (!categories[s.category]) categories[s.category] = { total: 0, count: 0 };
      categories[s.category].total += s.completionPercent;
      categories[s.category].count++;
    });
    const summary = Object.entries(categories).map(([cat, d]) => ({ category: cat, avgCompletion: Math.round(d.total / d.count), skillCount: d.count }));
    res.json(summary);
  } catch (e) { res.status(500).json({ error: 'Failed to get summary.' }); }
});

module.exports = router;
