const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    default: []
  },
  // New fields for geographic information
  location: {
    country: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      enum: ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Australia', 'Antarctica', 'Uncategorized'],
      default: 'Uncategorized'
    },
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Add text index for search functionality
postSchema.index({ 
  title: 'text', 
  summary: 'text', 
  'location.country': 'text',
  'location.city': 'text'
});

module.exports = mongoose.model('Post', postSchema);