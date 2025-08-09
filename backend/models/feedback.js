// models/feedback.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min:1, max:5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
