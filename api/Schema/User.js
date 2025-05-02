const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
  bio: {
    type: String,
    default: '',
    maxLength: 500
  },
  profilePhoto: {
    type: String,
    default: 'default-profile.jpg'
  },
  location: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: 'default-cover.jpg'
  },
  // socialLinks: {
  //   facebook: { type: String, default: '' },
  //   instagram: { type: String, default: '' },
  //   twitter: { type: String, default: '' }
  // },
  interests: [{
    type: String
  }],
  visitedCountries: [{
    type: String
  }],
  bucketList: [{
    type: String
  }],
  // travelPreferences: {
  //   accommodationTypes: [{ type: String }], // hotel, hostel, camping, etc.
  //   transportationPreferences: [{ type: String }], // plane, train, road trip, etc.
  //   travelStyle: [{ type: String }] // adventure, luxury, budget, foodie, etc.
  // },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);