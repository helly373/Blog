require('dotenv').config(); 
const express = require('express');
const { s3 } = require("./config/config");
const cors = require("cors");
const registerRoutes = require('./routes/UserRoutes');
const postRoutes = require('./routes/PostRoutes');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors({
  origin: ['https://blog-rust-nu-90.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use('/api/users', registerRoutes);
app.use("/api/post", postRoutes);
app.use("/api/upload", uploadRoutes);

// Only start the server when running directly (not when imported)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app
module.exports = app;