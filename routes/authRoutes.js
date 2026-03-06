const express = require("express");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // IMPORTANT

const router = express.Router();

// Register API
router.post("/register", register);

// Login API
router.post("/login", login);

// Protected Route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});

module.exports = router;