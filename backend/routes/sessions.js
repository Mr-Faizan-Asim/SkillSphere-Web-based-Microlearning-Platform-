const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const sessionController = require('../controllers/sessionController');

// Book a session (learner)
router.post('/', sessionController.book);

// Accept session request (mentor)
router.patch('/:id/accept', async (req, res) => {
  // logic can go in controller
  res.json({ message: 'Session accepted' });
});

module.exports = router;
