// models/user.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MentorProfileSchema = new Schema({
  bio: String,
  subjects: [String],         // e.g. ['react', 'algorithms']
  tags: [String],             // for search/recommend
  portfolio: [{ title: String, url: String }],
  rating: { type: Number, default: 0 }, // computed avg
  ratingCount: { type: Number, default: 0 },
  hourlyRate: Number,
  languages: [String],
  timezone: String,
  certifications: [String],
  verified: { type: Boolean, default: false }, // approval by admin
  approvedAt: Date,
  bankInfo: { type: Object } // optional for payouts
}, { _id: false });

const AvailabilitySlotSchema = new Schema({
  day: { type: String }, // 'Mon', 'Tue' OR date depending on design
  start: String,         // '14:00'
  end: String,           // '15:00'
  timezone: String
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true, index: true },
  email: { type:String, required:true, unique:true, index:true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['learner','mentor','admin'], required: true },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },

  // common profile data
  interests: [String],
  goals: [String],
  bio: String,
  location: String,
  languages: [String],

  // Mentor-specific details
  mentorProfile: { type: MentorProfileSchema, default: null },

  // Availability (mentor): array of available slots
  availability: [AvailabilitySlotSchema],

  // quick session stats
  sessionsCount: { type: Number, default: 0 },

  // tokens, emailVerified etc.
  emailVerified: { type: Boolean, default: false },
  meta: { type: Object, default: {} }
}, {
  timestamps: true
});

// Create text index for searching mentors by name, subjects, tags, bio
UserSchema.index({
  'name': 'text',
  'mentorProfile.bio': 'text',
  'mentorProfile.subjects': 'text',
  'mentorProfile.tags': 'text'
}, { weights: { 'name': 5, 'mentorProfile.subjects': 5, 'mentorProfile.tags': 4 } });

module.exports = mongoose.model('User', UserSchema);
