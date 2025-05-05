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

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error(`Error fetching post with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists and user is the author
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Verify ownership (only author can update)
    if (existingPost.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this post" });
    }
    
    // Prepare update data
    const { title, summary, categories, country, city, region } = req.body;
    const updateData = {
      title,
      summary
    };
    
    // Handle categories
    if (categories) {
      updateData.categories = typeof categories === 'string' 
        ? categories.split(',').map(cat => cat.trim()) 
        : categories;
    }
    
    // Prepare location data if provided
    const location = {};
    if (country) location.country = country;
    if (city) location.city = city;
    if (region) location.region = region;
    
    if (Object.keys(location).length > 0) {
      updateData.location = location;
    }
    
    // Handle file update if new image is uploaded
    if (req.file) {
      const file = req.file;
      const bucketName = process.env.AWS_BUCKET_NAME;
      
      // Extract the key from the existing imageUrl
      let oldImageKey = null;
      if (existingPost.imageUrl) {
        // Parse the URL to get the key (path after bucket name)
        const urlParts = existingPost.imageUrl.split('/');
        // Find the index of the bucket name in the URL
        const bucketIndex = urlParts.findIndex(part => part.includes(bucketName));
        if (bucketIndex !== -1) {
          // Key is everything after the bucket name in the path
          oldImageKey = urlParts.slice(bucketIndex + 1).join('/');
        }
      }
      
      // Delete old image if it exists
      if (oldImageKey) {
        const deleteParams = {
          Bucket: bucketName,
          Key: oldImageKey
        };
        
        try {
          await s3.deleteObject(deleteParams).promise();
          console.log(`Deleted old image: ${oldImageKey}`);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Continue with update even if delete fails
        }
      }
      
      // Upload new image
      const uploadParams = {
        Bucket: bucketName,
        Key: `images/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
      };
      
      const uploadResult = await s3.upload(uploadParams).promise();
      updateData.imageUrl = uploadResult.Location;
    }
    
    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists and user is the author
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Verify ownership (only author can delete)
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }
    
    // Delete image from S3 if it exists
    if (post.imageUrl) {
      const bucketName = process.env.AWS_BUCKET_NAME;
      
      // Extract the key from the imageUrl
      const urlParts = post.imageUrl.split('/');
      // Find the index of the bucket name in the URL
      const bucketIndex = urlParts.findIndex(part => part.includes(bucketName));
      
      if (bucketIndex !== -1) {
        // Key is everything after the bucket name in the path
        const imageKey = urlParts.slice(bucketIndex + 1).join('/');
        
        const deleteParams = {
          Bucket: bucketName,
          Key: imageKey
        };
        
        try {
          await s3.deleteObject(deleteParams).promise();
          console.log(`Deleted image: ${imageKey}`);
        } catch (deleteError) {
          console.error("Error deleting image from S3:", deleteError);
          // Continue with post deletion even if image delete fails
        }
      }
    }
    
    // Delete the post from database
    await Post.findByIdAndDelete(id);
    
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(`Error deleting post with ID ${req.params.id}:`, error);
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
  getPostById,
  updatePost,
  deletePost,
  getMapData
};