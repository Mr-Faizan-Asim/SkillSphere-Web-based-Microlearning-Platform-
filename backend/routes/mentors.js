const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const mentorController = require('../controllers/mentorController');

// Get all mentors (with filters & pagination)
router.get('/', mentorController.getAllMentors);

// Get best rated mentors
router.get('/best-rated', mentorController.getBestRatedMentors);

// Get mentor by id
router.get('/:id', mentorController.getMentorById);

// Create or update mentor profile (mentor only)
router.post('/apply', auth, requireRole('mentor'), mentorController.createOrUpdateMentorProfile);

// Delete mentor profile (mentor only)
router.delete('/delete', auth, requireRole('mentor'), mentorController.deleteMentorProfile);

module.exports = router;
