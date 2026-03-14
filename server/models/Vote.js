const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  initiatedBy: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  votes: [{
    userId: String,
    username: String,
    vote: { type: String, enum: ['approve', 'reject'] },
    votedAt: { type: Date, default: Date.now },
  }],
  totalMembers: { type: Number, required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000) },
  result: {
    approvals: { type: Number, default: 0 },
    rejections: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);
