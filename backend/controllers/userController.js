const User = require('../models/user');

// Get user profile by ID (no auth)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile by ID (no auth)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      bio,
      location,
      interests,
      goals,
      languages,
      avatarUrl,
      mentorProfile,
      availability,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (interests !== undefined) user.interests = interests;
    if (goals !== undefined) user.goals = goals;
    if (languages !== undefined) user.languages = languages;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    if (user.role === 'mentor' && mentorProfile) {
      user.mentorProfile = {
        ...user.mentorProfile?.toObject(),
        ...mentorProfile,
        verified: false,
      };
    }

    if (user.role === 'mentor' && availability) {
      user.availability = availability;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
