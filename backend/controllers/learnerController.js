// controllers/learnerController.js
const User = require("../models/user");
const Session = require("../models/session");

// AI Recommendation Engine
const recommendMentors = async (learner) => {
  try {
    const mentors = await User.find({ 
      role: 'mentor', 
      'mentorProfile.verified': true 
    })
    .populate('rating')
    .lean();

    return mentors.map(mentor => {
      let score = 0;
      
      // Subject matching (40% weight)
      if (learner.interests && mentor.mentorProfile.subjects) {
        const subjectMatch = learner.interests.filter(interest => 
          mentor.mentorProfile.subjects.includes(interest)
        ).length;
        score += subjectMatch * 4;
      }
      
      // Tag matching (30% weight)
      if (learner.goals && mentor.mentorProfile.tags) {
        const tagMatch = learner.goals.filter(goal => 
          mentor.mentorProfile.tags.includes(goal)
        ).length;
        score += tagMatch * 3;
      }
      
      // Rating (20% weight)
      score += (mentor.rating?.average || 0) * 0.2;
      
      // Response time (10% weight)
      if (mentor.mentorProfile.avgResponseTime < 24) score += 2;
      
      return { ...mentor, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
    
  } catch (error) {
    console.error('Mentor recommendation error:', error);
    return [];
  }
};

const suggestTopics = (learner) => {
  // AI-generated topics based on learner's profile
  const topicMatrix = {
    beginner: [
      "Introduction to Programming", 
      "Web Development Basics",
      "Version Control with Git"
    ],
    intermediate: [
      "API Design Principles",
      "Database Optimization",
      "Advanced JavaScript Patterns"
    ],
    advanced: [
      "Microservices Architecture",
      "Machine Learning Fundamentals",
      "Cloud Infrastructure"
    ]
  };
  
  const trendingTopics = [
    "AI-Powered Development Tools",
    "Blockchain Applications",
    "Quantum Computing Basics",
    "DevOps Best Practices"
  ];
  
  // Determine skill level
  const skillLevel = learner.skillLevel || 'beginner';
  const levelTopics = topicMatrix[skillLevel] || [];
  
  // Combine with trending topics and personal interests
  return [
    ...levelTopics,
    ...trendingTopics,
    ...(learner.interests || [])
  ]
  .filter((topic, index, self) => 
    self.indexOf(topic) === index
  )
  .slice(0, 5);
};

exports.getDashboard = async (req, res) => {
  try {
    const learner = await User.findById(req.user._id)
      .select('interests goals skillLevel')
      .lean();

    const [recommendedMentors, upcomingSessions] = await Promise.all([
      recommendMentors(learner),
      Session.find({ learner: req.user._id, status: 'upcoming' })
        .sort('startTime')
        .limit(3)
        .populate('mentor', 'name avatar')
        .lean()
    ]);

    // Add online status to mentors
    const mentorsWithStatus = recommendedMentors.map(mentor => ({
      ...mentor,
      online: global.onlineMentors.includes(mentor._id.toString())
    }));

    // Quick actions
    const quickActions = [
      { name: 'Book Session', link: '/sessions/book', icon: 'calendar-plus' },
      { name: 'Browse Mentors', link: '/mentors', icon: 'users' },
      { name: 'View History', link: '/sessions/history', icon: 'history' },
      { name: 'Learning Resources', link: '/resources', icon: 'book-open' }
    ];

    // Progress tracking
    const completedSessions = await Session.countDocuments({ 
      learner: req.user._id, 
      status: 'completed' 
    });

    res.json({
      recommendedMentors: mentorsWithStatus,
      suggestedTopics: suggestTopics(learner),
      quickActions,
      learningStats: {
        completedSessions,
        upcomingSessions,
        hoursLearned: completedSessions * 1.5 // Assuming 1.5hrs/session
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};