const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: function() {
      return !this.isVerified;
    }
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  unsubscribed: {
    type: Boolean,
    default: false
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  unsubscribeToken: {
    type: String,
    default: null
  },
  unsubscribeTokenExpires: {
    type: Date,
    default: null
  },
  preferredTime: {
    type: String,
    default: '09:00' // Default to 9:00 AM in HH:MM format
  },
  preferredDays: {
    type: [String],
    default: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] // Default to all days (mon-sun)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a secure unsubscribe token
userSchema.methods.generateUnsubscribeToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.unsubscribeToken = token;
  this.unsubscribeTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // Token expires in 7 days
  return token;
};

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ isVerified: 1, unsubscribed: 1, preferredTime: 1 });
userSchema.index({ unsubscribeToken: 1, unsubscribeTokenExpires: 1 });
userSchema.index({ preferredTime: 1 });

module.exports = mongoose.model('User', userSchema);