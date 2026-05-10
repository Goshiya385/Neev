const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Project = require('../models/Project');
const axios = require('axios');
const router = express.Router();
router.use(auth);
router.use(roleCheck('student'));

router.get('/', async (req, res) => {
  try { res.json(await Project.find({ studentId: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Failed to fetch projects.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, semester, status } = req.body;
    const project = new Project({ studentId: req.user._id, title, description, techStack, githubUrl, liveUrl, semester: semester || req.user.semester, status: status || 'idea' });
    await project.save();
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ error: 'Failed to create project.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id, studentId: req.user._id }, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (e) { res.status(500).json({ error: 'Failed to update project.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, studentId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete project.' }); }
});

router.post('/:id/ai-resume-points', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    try {
      const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/ml/resume/generate-points`, { title: project.title, description: project.description, techStack: project.techStack });
      project.aiResumePoints = mlRes.data.points;
    } catch {
      project.aiResumePoints = [
        `Developed ${project.title} using ${(project.techStack || []).join(', ')}`,
        `Implemented core features with focus on scalability and user experience`,
        `Managed end-to-end development lifecycle from ideation to deployment`,
      ];
    }
    await project.save();
    res.json(project);
  } catch (e) { res.status(500).json({ error: 'Failed to generate resume points.' }); }
});

module.exports = router;
