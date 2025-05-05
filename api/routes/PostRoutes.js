const express = require("express");
const multer = require("multer");
const verifyToken = require("../middleware/verifyToken");
const postController = require("../controller/PostController");

const router = express.Router();

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/posts - Create a new post (protected route)
router.post("/create-posts", verifyToken, upload.single("image"), postController.createPost);

// GET /api/posts - Fetch all posts (optionally filter by query params)
router.get("/posts", postController.getAllPosts);

router.get('/postbyId/:id', verifyToken, postController.getPostById);
router.put('/update-posts/:id', verifyToken, upload.single('image'), postController.updatePost);
router.delete('/delete-posts/:id', verifyToken, postController.deletePost);

// Map-related routes
router.get("/map-data", postController.getMapData);
router.get("/region/:region", postController.getPostsByRegion);
router.get("/country/:country", postController.getPostsByCountry);

module.exports = router;