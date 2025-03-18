// config.js
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,     // from .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // from .env
  region: process.env.AWS_REGION, // e.g. "us-east-1"
});

// Export the configured S3 instance if needed
const s3 = new AWS.S3();

module.exports = { s3 };
