const mongoose = require('mongoose');

// Temporary storage for unverified users
const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  verificationOTP: {
    type: String,
    required: true
  },
  otpExpire: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
  }
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
