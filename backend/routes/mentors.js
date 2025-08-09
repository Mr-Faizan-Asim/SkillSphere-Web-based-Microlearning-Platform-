const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const mentorController = require('../controllers/mentorController');

// Search mentors
router.get('/', mentorController.search);

// Apply or update mentor profile
router.post('/apply', auth, requireRole('mentor'), async (req, res) => {
  try {
    const { subjects, tags, bio, portfolio } = req.body;
    req.user.mentorProfile = {
      subjects,
      tags,
      bio,
      portfolio,
      verified: false
    };
    await req.user.save();
    res.json({ message: 'Mentor profile submitted for approval' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
