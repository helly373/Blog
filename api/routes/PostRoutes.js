// routes/postRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const postController = require("../controller/PostController");
require("dotenv").config();

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/posts - Create a new post (protected route)
router.post("/posts", verifyToken, upload.single("image"), postController.createPost);

// GET /api/posts - Fetch all posts (protected route)
router.get("/posts", verifyToken, postController.getPosts);

module.exports = router;
