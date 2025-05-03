// userController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require('../Schema/User');
require("dotenv").config();

exports.register = async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document (do not store confirmPassword in the database)
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully.", 
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        // Optionally include hashedPassword if needed
        // password: hashedPassword 
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate the password (assuming passwords are hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token (expires in 24 hours)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find user by id and exclude the password field for security
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware that puts user ID in req.user
    
    // Fields that can be updated
    const {
      bio,
      location,
      interests,
      visitedCountries,
      bucketList,
      profilePhoto,    
      coverPhoto     
    } = req.body;
    
    // Create an object with only the fields that were provided
    const updateData = {};
    
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (visitedCountries !== undefined) updateData.visitedCountries = visitedCountries;
    if (bucketList !== undefined) updateData.bucketList = bucketList;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;  
    if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;    
    
    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from the returned data
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        profilePhoto: updatedUser.profilePhoto,
        coverPhoto: updatedUser.coverPhoto,
        interests: updatedUser.interests,
        visitedCountries: updatedUser.visitedCountries,
        bucketList: updatedUser.bucketList,
        followersCount: updatedUser.followers.length,
        followingCount: updatedUser.following.length
      }
    });
    
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error during profile update." });
  }
};


// Follow a user
exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userToFollowId = req.params.id;
    
    // Make sure user isn't trying to follow themselves
    if (userId === userToFollowId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }
    
    // Find the user to follow
    const userToFollow = await User.findById(userToFollowId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Check if already following
    const currentUser = await User.findById(userId);
    if (currentUser.following.includes(userToFollowId)) {
      return res.status(400).json({ message: "You are already following this user." });
    }
    
    // Add to following list for current user
    await User.findByIdAndUpdate(userId, {
      $push: { following: userToFollowId }
    });
    
    // Add to followers list for target user
    await User.findByIdAndUpdate(userToFollowId, {
      $push: { followers: userId }
    });
    
    // Get updated user information after the follow action
    const updatedCurrentUser = await User.findById(userId).select('-password');
    const updatedFollowedUser = await User.findById(userToFollowId).select('-password');
    
    res.status(200).json({ 
      message: "User followed successfully.",
      currentUser: {
        id: updatedCurrentUser._id,
        username: updatedCurrentUser.username,
        followingCount: updatedCurrentUser.following.length,
        following: updatedCurrentUser.following
      },
      followedUser: {
        id: updatedFollowedUser._id,
        username: updatedFollowedUser.username,
        followersCount: updatedFollowedUser.followers.length,
        followers: updatedFollowedUser.followers
      }
    });
    
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error during follow operation." });
  }
};
// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userToUnfollowId = req.params.id;
    
    // Find the user to unfollow
    const userToUnfollow = await User.findById(userToUnfollowId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Check if already not following
    const currentUser = await User.findById(userId);
    if (!currentUser.following.includes(userToUnfollowId)) {
      return res.status(400).json({ message: "You are not following this user." });
    }
    
    // Remove from following list for current user
    await User.findByIdAndUpdate(userId, {
      $pull: { following: userToUnfollowId }
    });
    
    // Remove from followers list for target user
    await User.findByIdAndUpdate(userToUnfollowId, {
      $pull: { followers: userId }
    });
    
    // Get updated user information after the unfollow action
    const updatedCurrentUser = await User.findById(userId).select('-password');
    const updatedUnfollowedUser = await User.findById(userToUnfollowId).select('-password');
    
    res.status(200).json({ 
      message: "User unfollowed successfully.",
      currentUser: {
        id: updatedCurrentUser._id,
        username: updatedCurrentUser.username,
        followingCount: updatedCurrentUser.following.length,
        following: updatedCurrentUser.following
      },
      unfollowedUser: {
        id: updatedUnfollowedUser._id,
        username: updatedUnfollowedUser.username,
        followersCount: updatedUnfollowedUser.followers.length,
        followers: updatedUnfollowedUser.followers
      }
    });
    
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Server error during unfollow operation." });
  }
};