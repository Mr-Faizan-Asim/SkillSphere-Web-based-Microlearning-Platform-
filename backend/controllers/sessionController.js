// controllers/sessionController.js
const Session = require('../models/session');
const User = require('../models/user');

exports.book = async (req, res) => {
  const { mentorId, learnerId: bodyLearnerId, scheduledAt, durationMinutes=30, channel='video' } = req.body;
  const learnerId = bodyLearnerId;

  // basic checks
  const mentor = await User.findById(mentorId);
  if(!mentor || mentor.role !== 'mentor') return res.status(404).json({ error: 'Mentor not found' });

  // optionally check mentor availability/conflicts (aggregation to check existing sessions)
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes*60000);

  const conflict = await Session.findOne({
    mentorId,
    status: { $in: ['confirmed','requested'] },
    $or: [
      { scheduledAt: { $lt: end, $gte: start } },
      // overlap checks might need better handling depending on design
    ]
  });

  if(conflict) return res.status(409).json({ error: 'Mentor not available at this time' });

  const session = await Session.create({ mentorId, learnerId, scheduledAt: start, durationMinutes, channel });
  res.status(201).json(session);
};
