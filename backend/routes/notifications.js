const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Notification = require('../models/Notification');
const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch notifications.' }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ error: 'Not found.' });
    res.json(n);
  } catch (e) { res.status(500).json({ error: 'Failed to mark read.' }); }
});

module.exports = router;
