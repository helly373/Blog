require('dotenv').config(); 
const express = require('express');
const { s3 } = require("./config/config");
const cors = require("cors");
const registerRoutes = require('./routes/UserRoutes');
const postRoutes = require('./routes/PostRoutes');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors({
  origin:['https://traveller-xjld.onrender.com', 'http://localhost:3000']
}));
app.use(express.json());

app.use('/api/users', registerRoutes);
app.use("/api/post", postRoutes);
app.use("/api/upload", uploadRoutes);

// Always bind to a port regardless of environment
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express app
module.exports = app;