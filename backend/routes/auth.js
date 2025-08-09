const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { issueToken } = require('../middlewares/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, interests, goals } = req.body;
    if (!['learner', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, passwordHash: hash, role, interests, goals
    });
    res.status(201).json({ token: issueToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: issueToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
