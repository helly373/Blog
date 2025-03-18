const express = require('express');
const router = express.Router();
const User = require('../Schema/User'); // Adjust the path as needed

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if password matches confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Optionally: Check if user already exists (by email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Create new user document
    const newUser = new User({
      username,
      email,
      password,
      confirmPassword
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // In a real app, passwords should be hashed and compared with bcrypt.
    // Here we compare plain text passwords for demonstration purposes.
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.json({ message: "User logged in successfully." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;
