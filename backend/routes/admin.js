const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const User = require('../models/user');

// Get mentor applications
router.get('/mentor-applications', auth, requireRole('admin'), async (req, res) => {
  const pending = await User.find({ role: 'mentor', 'mentorProfile.verified': false });
  res.json(pending);
});

// Approve mentor
router.patch('/mentor-applications/:id/approve', auth, requireRole('admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { 'mentorProfile.verified': true, 'mentorProfile.approvedAt': new Date() });
  res.json({ message: 'Mentor approved' });
});

// Analytics
router.get('/analytics', auth, requireRole('admin'), adminController.analytics);

module.exports = router;
