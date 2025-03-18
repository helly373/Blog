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
  confirmPassword: {
    type: String,
    required: true
  }
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (this.password !== this.confirmPassword) {
    return next(new Error("Passwords do not match"));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
