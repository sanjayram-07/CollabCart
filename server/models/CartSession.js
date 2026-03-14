const mongoose = require('mongoose');

const cartSessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  name: { type: String, default: 'Shopping Session' },
  status: { type: String, enum: ['active', 'checkout', 'completed', 'expired'], default: 'active' },
  members: [{
    userId: String,
    username: String,
    color: String,
    joinedAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
  }],
  maxMembers: { type: Number, default: 10 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

cartSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CartSession', cartSessionSchema);
