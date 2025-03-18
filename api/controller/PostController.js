// controllers/postController.js
const { s3 } = require("../config/config");
const Post = require("../Schema/Post");
require("dotenv").config();

// Controller to create a new post
exports.createPost = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const params = {
      Bucket: bucketName,
      Key: `images/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read"
    };

    // Upload the file to S3
    const uploadResult = await s3.upload(params).promise();

    // Create a new post using the user ID from token (req.userId)
    const { title, summary, categories } = req.body;
    const newPost = new Post({
      title,
      author: req.userId, // You might also store additional user details if needed
      summary,
      imageUrl: uploadResult.Location,
      categories: categories ? categories.split(",") : [],
      user: req.userId
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to fetch posts
exports.getPosts = async (req, res) => {
  try {
    // Optionally, to filter posts for the authenticated user:
    // const posts = await Post.find({ user: req.userId }).sort({ date: -1 });
    // For now, fetch all posts sorted by date (newest first)
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
