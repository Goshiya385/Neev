const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const MockTest = require('../models/MockTest');
const { calculatePlacementScore } = require('../services/placementScore');
const { COMPANY_PACKS } = require('../config/constants');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

router.get('/score', async (req, res) => {
  try { res.json(await calculatePlacementScore(req.user._id)); }
  catch (e) { res.status(500).json({ error: 'Failed to get placement score.' }); }
});

router.get('/company/:company', async (req, res) => {
  try {
    const pack = COMPANY_PACKS[req.params.company];
    if (!pack) return res.status(404).json({ error: 'Company pack not found.' });
    res.json(pack);
  } catch (e) { res.status(500).json({ error: 'Failed to get company pack.' }); }
});

router.get('/interview-meter', async (req, res) => {
  try {
    const breakdown = await calculatePlacementScore(req.user._id);
    res.json({ dsaReady: breakdown.dsaSkills, projectReady: breakdown.projects, aptitudeReady: breakdown.aptitude, commReady: breakdown.communication, overall: breakdown.total });
  } catch (e) { res.status(500).json({ error: 'Failed to get interview meter.' }); }
});

router.post('/mock-test', async (req, res) => {
  try {
    const { testType, subject, score, maxScore, timeTaken, weakTopics, accuracy } = req.body;
    const test = new MockTest({ studentId: req.user._id, testType, subject, score, maxScore, timeTaken, weakTopics, accuracy });
    await test.save();
    res.status(201).json(test);
  } catch (e) { res.status(500).json({ error: 'Failed to save mock test.' }); }
});

router.get('/mock-history', async (req, res) => {
  try { res.json(await MockTest.find({ studentId: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Failed to get mock history.' }); }
});

module.exports = router;
