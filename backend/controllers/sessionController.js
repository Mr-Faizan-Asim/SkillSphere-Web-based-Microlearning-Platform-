// controllers/sessionController.js
const Session = require('../models/session');
const User = require('../models/user');

// ======================
// Book a new session
// ======================
exports.book = async (req, res) => {
  try {
    const {
      mentorId,
      learnerId: bodyLearnerId,
      scheduledAt,
      durationMinutes = 30,
      channel = 'video'
    } = req.body;

    const learnerId = bodyLearnerId;

    // Validate mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Check conflicts
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const conflict = await Session.findOne({
      mentorId,
      status: { $in: ['confirmed', 'requested'] },
      $or: [
        { scheduledAt: { $lt: end, $gte: start } }
        // Add more overlap conditions if needed
      ]
    });

    if (conflict) {
      return res.status(409).json({ error: 'Mentor not available at this time' });
    }

    const session = await Session.create({
      mentorId,
      learnerId,
      scheduledAt: start,
      durationMinutes,
      channel
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ error: 'Server error while booking session' });
  }
};

// ======================
// Get all sessions (admin or for analytics)
// ======================
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('mentorId learnerId', 'name email role');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
};

// ======================
// Get sessions for a learner
// ======================
exports.getLearnerSessions = async (req, res) => {
  try {
    const { learnerId } = req.params;
    const now = new Date();

    const past = await Session.find({ learnerId, scheduledAt: { $lt: now } })
      .populate('mentorId', 'name email');

    const upcoming = await Session.find({ learnerId, scheduledAt: { $gte: now } })
      .populate('mentorId', 'name email');

    res.json({ past, upcoming });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching learner sessions' });
  }
};

// ======================
// Get sessions for a mentor
// ======================
exports.getMentorSessions = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const now = new Date();

    const past = await Session.find({ mentorId, scheduledAt: { $lt: now } })
      .populate('learnerId', 'name email');

    const upcoming = await Session.find({ mentorId, scheduledAt: { $gte: now } })
      .populate('learnerId', 'name email');

    res.json({ past, upcoming });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mentor sessions' });
  }
};


exports.acceptSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { meetingLink } = req.body; // <-- get meetingLink from frontend request

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only allow if current status is 'requested'
    if (session.status !== 'requested') {
      return res.status(400).json({ error: 'Session cannot be accepted in its current status' });
    }

    session.status = 'confirmed';

    // Save meeting link if provided
    if (meetingLink) {
      session.meetingLink = meetingLink;
    }

    await session.save();

    res.json({ message: 'Session accepted', session });
  } catch (error) {
    console.error('Error accepting session:', error);
    res.status(500).json({ error: 'Server error while accepting session' });
  }
};


// ======================
// Decline session request (mentor)
// ======================
exports.declineSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only allow if current status is 'requested'
    if (session.status !== 'requested') {
      return res.status(400).json({ error: 'Session cannot be declined in its current status' });
    }

    session.status = 'rejected';
    await session.save();

    res.json({ message: 'Session declined', session });
  } catch (error) {
    console.error('Error declining session:', error);
    res.status(500).json({ error: 'Server error while declining session' });
  }
};
