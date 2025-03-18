require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { s3 } = require("./config/config");
const cors = require("cors");
const registerRoutes = require('./routes/UserRoutes'); 
const postRoutes = require('./routes/PostRoutes')


const app = express();
app.use(cors()); 
app.use(express.json());

app.use('/api', registerRoutes);
app.use("/api", postRoutes);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
