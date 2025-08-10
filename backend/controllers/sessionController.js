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


// Add this new controller
exports.rateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const learnerId = req.user.id;

    // Validate input
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Find session
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session belongs to learner
    if (session.learnerId.toString() !== learnerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to rate this session' });
    }

    // Check if session is completed and not already rated
    if (session.status !== 'completed' || session.isRated) {
      return res.status(400).json({ 
        error: 'Session must be completed and unrated to submit a rating' 
      });
    }

    // Update session
    session.rating = rating;
    session.review = review;
    session.isRated = true;
    await session.save();

    // Update mentor's rating
    const mentor = await User.findById(session.mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Calculate new average rating
    const currentTotal = mentor.mentorProfile.rating * mentor.mentorProfile.ratingCount;
    const newTotal = currentTotal + rating;
    const newCount = mentor.mentorProfile.ratingCount + 1;
    const newAvg = newTotal / newCount;

    mentor.mentorProfile.rating = newAvg;
    mentor.mentorProfile.ratingCount = newCount;
    await mentor.save();

    res.json({ 
      message: 'Rating submitted successfully',
      session,
      mentorRating: newAvg 
    });
  } catch (error) {
    console.error('Error rating mentor:', error);
    res.status(500).json({ error: 'Server error while submitting rating' });
  }
};


exports.markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user.id;

    // Find session
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session belongs to learner
    if (session.learnerId.toString() !== learnerId.toString()) {
      return res.status(403).json({ error: 'Not authorized to mark this session as completed' });
    }

    // Check if session is confirmed and in the past
    if (session.status !== 'confirmed') {
      return res.status(400).json({ 
        error: 'Session must be confirmed to mark as completed' 
      });
    }
    
    // Check if session is in the past (occurred at least 5 minutes ago)
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    if (sessionTime > now) {
      return res.status(400).json({ 
        error: 'Cannot mark future sessions as completed' 
      });
    }
    
    // Update session status
    session.status = 'completed';
    await session.save();

    res.json({ 
      message: 'Session marked as completed',
      session
    });
  } catch (error) {
    console.error('Error marking session as completed:', error);
    res.status(500).json({ error: 'Server error while marking session as completed' });
  }
};