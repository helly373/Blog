const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const auth=require('../middleware/verifyToken');



// Route for user registration
router.post('/register', userController.register);

// Route for user login
router.post('/login', userController.login);

// Route for getting a user by ID
router.get('/:id', userController.getUserById);

// Protected routes (auth required)
router.put('/profile', auth, userController.updateProfile);
router.post('/follow/:id', auth, userController.followUser);
router.post('/unfollow/:id', auth, userController.unfollowUser);

module.exports = router;
