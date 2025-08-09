const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const feedbackController = require('../controllers/feedbackController');

// Leave feedback (learner)
router.post('/:sessionId', auth, requireRole('learner'), feedbackController.leave);

module.exports = router;
