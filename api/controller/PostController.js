const { s3 } = require("../config/config");
const Post = require("../Schema/Post");
require("dotenv").config();

// Create a new post
const createPost = async (req, res) => {
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

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    // Create a new post using user id from token (req.userId)
    const { title, summary, categories, country, city, region } = req.body;
    
    // Prepare location data if provided
    const location = {};
    if (country) location.country = country;
    if (city) location.city = city;
    if (region) location.region = region;
    

    const newPost = new Post({
      title,
      summary,
      imageUrl: uploadResult.Location,
      categories: categories ? categories.split(",") : [],
      location: Object.keys(location).length > 0 ? location : undefined,
      author: req.user.id,
      user: req.user.id
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch all posts
const getAllPosts = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { region, country, category } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    if (region) filter["location.region"] = region;
    if (country) filter["location.country"] = country;
    if (category) filter.categories = category;
    
    // Fetch posts with optional filters
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get posts by region
const getPostsByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const posts = await Post.find({"location.region": region}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(`Error fetching posts for region ${req.params.region}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get posts by country
const getPostsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const posts = await Post.find({"location.country": country}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(`Error fetching posts for country ${req.params.country}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get map data (aggregated by country)
const getMapData = async (req, res) => {
  try {
    // Get counts of posts by country
    const countryCounts = await Post.aggregate([
      { $match: { "location.country": { $exists: true, $ne: null } } },
      { $group: { _id: "$location.country", count: { $sum: 1 } } },
      { $project: { country: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    
    // Get counts of posts by region
    const regionCounts = await Post.aggregate([
      { $match: { "location.region": { $exists: true, $ne: null } } },
      { $group: { _id: "$location.region", count: { $sum: 1 } } },
      { $project: { region: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    
   
    res.json({
      countryCounts,
      regionCounts,
    });
  } catch (error) {
    console.error("Error fetching map data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostsByRegion,
  getPostsByCountry,
  getMapData
};