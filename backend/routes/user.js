const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user profile by ID (sent from frontend)
router.get('/:id', userController.getUserById);

// Update user profile by ID (sent from frontend)
router.put('/:id', userController.updateUserProfile);

module.exports = router;
