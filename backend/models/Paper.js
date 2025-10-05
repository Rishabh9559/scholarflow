const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a paper title'],
    trim: true,
    maxlength: [500, 'Title cannot be more than 500 characters']
  },
  authors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    affiliation: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    }
  }],
  abstract: {
    type: String,
    required: [true, 'Please provide an abstract'],
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  introduction: {
    type: String,
    trim: true
  },
  literatureReview: {
    type: String,
    trim: true
  },
  methodology: {
    type: String,
    trim: true
  },
  conclusion: {
    type: String,
    trim: true
  },
  references: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
paperSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Paper', paperSchema);
