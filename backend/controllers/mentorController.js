const User = require('../models/user');

// Get all mentors with pagination, filtering by goal or other params
exports.getAllMentors = async (req, res) => {
  try {
    const { page = 1, limit = 10, goal, minRating = 0 } = req.query;
    const filter = { role: 'mentor'};

    if (goal) {
      filter.goals = { $in: [goal] }; // Search mentors by goal field
    }

    const skip = (page - 1) * limit;

    let mentors = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    mentors = mentors.filter(m => (m.mentorProfile?.rating ?? 0) >= Number(minRating));

    res.json({ data: mentors, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get mentor by ID
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' }).lean();
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create or update mentor profile for logged-in mentor
exports.createOrUpdateMentorProfile = async (req, res) => {
  try {
    const { subjects, tags, bio, portfolio, hourlyRate, languages, timezone, certifications } = req.body;
    req.user.mentorProfile = {
      bio,
      subjects,
      tags,
      portfolio,
      hourlyRate,
      languages,
      timezone,
      certifications,
      verified: false, // Needs admin approval
    };
    await req.user.save();
    res.json({ message: 'Mentor profile submitted/updated for approval' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete mentor profile (optional: only admin or mentor self)
exports.deleteMentorProfile = async (req, res) => {
  try {
    req.user.mentorProfile = null;
    await req.user.save();
    res.json({ message: 'Mentor profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get best rated mentor(s)
exports.getBestRatedMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', 'mentorProfile.verified': true })
      .sort({ 'mentorProfile.rating': -1 })
      .limit(5)
      .lean();

    if (mentors.length === 0) {
      return res.json({ data: [], message: 'No mentors are rated yet' });
    }
    res.json({ data: mentors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
