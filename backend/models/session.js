// models/session.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scheduledAt: { type: Date, required: true, index: true },
  durationMinutes: { type: Number, default: 30 },
  status: { type: String, enum: ['requested','confirmed','cancelled','completed','rejected'], default: 'requested' },
  channel: { type: String, enum: ['video','audio','chat','link'], default: 'video' },
  meetingLink: String,
  notes: String,
  resources: [{ title: String, url: String }],
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
