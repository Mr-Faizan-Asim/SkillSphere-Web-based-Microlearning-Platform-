
const User = require("../models/user");
const Session = require("../models/session");

// Example AI logic placeholder (can be replaced with actual ML/AI service)
const recommendMentors = async (learner) => {
  // Get mentors sorted by rating & matching learner interests
  const mentors = await User.find({ role: 'mentor', 'mentorProfile.verified': true })
    .lean();

  // Simple scoring: match on subjects/tags
  const scoredMentors = mentors.map(m => {
    let score = 0;
    if (learner.interests) {
      const interestMatch = m.mentorProfile.subjects.filter(s => learner.interests.includes(s)).length;
      score += interestMatch * 2;
    }
    if (learner.goals) {
      const goalMatch = m.mentorProfile.tags.filter(t => learner.goals.includes(t)).length;
      score += goalMatch;
    }
    score += (m.rating || 0); // higher-rated mentors rank better
    return { ...m, score };
  });

  // Sort by score descending
  return scoredMentors.sort((a, b) => b.score - a.score).slice(0, 5);
};

const suggestTopics = async (learner) => {
  // Placeholder: could be generated from AI or trending topics
  const trendingTopics = ["JavaScript Best Practices", "AI for Beginners", "UI/UX Fundamentals", "Data Structures", "Cloud Basics"];
  return trendingTopics.filter(topic => 
    learner.interests?.some(interest => topic.toLowerCase().includes(interest.toLowerCase()))
  ).slice(0, 5);
};

exports.getDashboard = async (req, res) => {
  try {
    const learner = await User.findById(req.user._id).lean();

    const recommendedMentors = await recommendMentors(learner);
    const suggestedTopics = await suggestTopics(learner);

    // Quick actions
    const quickActions = [
      { name: 'Book Session', link: '/sessions/book' },
      { name: 'Browse Mentors', link: '/mentors' },
      { name: 'View History', link: '/sessions/history' },
    ];

    // Mentor online/offline status
    // In real-time apps, this would come from WebSocket or Redis
    const onlineMentorIds = global.onlineMentors || []; 
    const mentorsWithStatus = recommendedMentors.map(m => ({
      ...m,
      online: onlineMentorIds.includes(m._id.toString())
    }));

    res.json({
      recommendedMentors: mentorsWithStatus,
      suggestedTopics,
      quickActions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
