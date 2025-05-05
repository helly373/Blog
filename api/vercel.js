// api/vercel.js
require('dotenv').config();
const express = require('express');
// const cors = require("cors");

// Try to load mongoose and handle the error if it fails
let mongoose;
try {
  mongoose = require('mongoose');
  
  // Configure mongoose
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
  }
} catch (error) {
  console.error('Failed to load mongoose:', error);
}

// Create express app
const app = express();

// Apply middleware
// app.use(cors({
//   origin: ['https://blog-rust-nu-90.vercel.app', 'http://localhost:3000'],
//   credentials: true
// }));
app.use(express.json());

// Import routes - wrap in try/catch to handle any import errors
try {
  const registerRoutes = require('./routes/UserRoutes');
  const postRoutes = require('./routes/PostRoutes');
  const uploadRoutes = require('./routes/upload');

  app.use('/api/users', registerRoutes);
  app.use("/api/post", postRoutes);
  app.use("/api/upload", uploadRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
  
  // Add fallback routes that return an error
  app.use('/api/users', (req, res) => {
    res.status(500).json({ error: 'User routes unavailable' });
  });
  
  app.use('/api/post', (req, res) => {
    res.status(500).json({ error: 'Post routes unavailable' });
  });
  
  app.use('/api/upload', (req, res) => {
    res.status(500).json({ error: 'Upload routes unavailable' });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongooseLoaded: !!mongoose });
});

// Export the app
module.exports = app;