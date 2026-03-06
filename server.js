require("dotenv").config();
 
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
 
const app = express();
 
// Connect to MongoDB
connectDB();
 
// Enable CORS
app.use(cors({
  origin: "*"
}));
 
// Middleware
app.use(express.json());
 
// Routes
app.use("/api/auth", authRoutes);
 
// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
 
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "404 Error - Not Found"
  });
});   