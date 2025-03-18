require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const registerRoutes = require('./routes/UserRoutes'); 

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Enable CORS to allow frontend communication
app.use(cors());

// Enable JSON parsing for incoming requests
app.use(express.json());

// Use routes (All routes in UserRoutes will be prefixed with "/user")
app.use('/user', registerRoutes);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
