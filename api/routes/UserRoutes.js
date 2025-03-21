const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');



// Route for user registration
router.post('/register', userController.register);

// Route for user login
router.post('/login', userController.login);

// Route for getting a user by ID
router.get('/users/:id', userController.getUserById);

module.exports = router;
