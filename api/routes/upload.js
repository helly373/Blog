const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/verifyToken');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload to S3 and return URL
const uploadToS3 = (file, userId, fileType) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime();
    const fileName = `${userId}/${fileType}_${timestamp}_${path.basename(file.filename)}`;
    
    const fileStream = fs.createReadStream(file.path);
    fileStream.on('error', error => {
      console.error('File read error', error);
      reject(error);
    });

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_USER,
      Key: fileName,
      Body: fileStream,
      ContentType: file.mimetype
    };

    s3.upload(uploadParams, (err, data) => {
      // Clean up temp file
      fs.unlink(file.path, unlinkErr => {
        if (unlinkErr) {
          console.error('Error removing temp file', unlinkErr);
        }
      });

      if (err) {
        console.error('S3 upload error', err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

// POST /api/upload - Upload a file to S3
router.post('/:type', auth, upload.single('image'), async (req, res) => {
  try {
    const { type } = req.params; // 'profilePicture' or 'coverPicture'
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadToS3(req.file, userId, type);
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to upload: ${error.message}` 
    });
  }
});

module.exports = router;