// controllers/adminController.js
const User = require('../models/user');
const Session = require('../models/session');
const Feedback = require('../models/feedback');

exports.analytics = async (req,res) => {
  const totalUsers = await User.countDocuments();
  const mentorsCount = await User.countDocuments({ role: 'mentor' });
  const learnersCount = await User.countDocuments({ role: 'learner' });
  const sessionsCount = await Session.countDocuments();
  const avgRating = (await Feedback.aggregate([{ $group: { _id:null, avg: { $avg: "$rating" }}}]))[0]?.avg ?? 0;

  res.json({ totalUsers, mentorsCount, learnersCount, sessionsCount, avgRating });
};
