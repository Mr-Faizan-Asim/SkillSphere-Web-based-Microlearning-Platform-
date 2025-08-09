// routes/learnerRoutes.js
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middlewares/auth');
const learnerController = require('../controllers/learnerController');

// Get learner dashboard
router.get('/dashboard', learnerController.getDashboard);

module.exports = router;