// controllers/feedbackController.js
const Feedback = require('../models/feedback');
const User = require('../models/user');

exports.leave = async (req, res) => {
  const { sessionId, rating, comment } = req.body;
  const learnerId = req.user._id;

  // Ensure session exists & user was learner for it
  const session = await Session.findById(sessionId);
  if(!session) return res.status(404).json({error:'Session not found'});
  if(String(session.learnerId) !== String(learnerId)) return res.status(403).json({error:'Not allowed'});

  const fb = await Feedback.create({ sessionId, mentorId: session.mentorId, learnerId, rating, comment });

  // update mentor rating atomically
  await User.findByIdAndUpdate(session.mentorId, {
    $inc: { 'mentorProfile.ratingCount': 1, sessionsCount: 1 },
    $set: {}
  });

  // better: recompute average using aggregation to avoid float drift:
  const agg = await Feedback.aggregate([
    { $match: { mentorId: session.mentorId } },
    { $group: { _id: '$mentorId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if(agg[0]) {
    await User.findByIdAndUpdate(session.mentorId, { 'mentorProfile.rating': agg[0].avg, 'mentorProfile.ratingCount': agg[0].count });
  }

  res.json(fb);
};
