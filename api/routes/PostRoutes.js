const express = require("express");
const multer = require("multer");
const verifyToken = require("../middleware/verifyToken");
const postController = require("../controller/PostController");

const router = express.Router();

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/posts - Create a new post (protected route)
router.post("/posts", verifyToken, upload.single("image"), postController.createPost);

// GET /api/posts - Fetch all posts (optionally filter by query params)
router.get("/posts", postController.getAllPosts);

// Map-related routes
router.get("/map-data", postController.getMapData);
router.get("/posts/region/:region", postController.getPostsByRegion);
router.get("/posts/country/:country", postController.getPostsByCountry);

module.exports = router;