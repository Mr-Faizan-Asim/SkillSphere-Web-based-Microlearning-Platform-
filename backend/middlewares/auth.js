// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = process.env.JWT_SECRET || 'devsecret';

exports.issueToken = user => jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });

exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch(err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if(!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};
