const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const sessionController = require('../controllers/sessionController');

// Book a session (learner)
router.post('/', sessionController.book);

// Get all sessions (admin or dashboard)
router.get('/', sessionController.getAllSessions);

// Get sessions for a specific learner
router.get('/learner/:learnerId', sessionController.getLearnerSessions);

// Get sessions for a specific mentor
router.get('/mentor/:mentorId', sessionController.getMentorSessions);

// Accept session request (mentor)
router.patch('/:id/accept', async (req, res) => {
  res.json({ message: 'Session accepted' });
});

module.exports = router;
