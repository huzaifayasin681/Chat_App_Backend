const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/userController");
const User = require("../models/User"); // ✅ Import User model

// GET all users (only if authenticated)
router.get("/", protect, getAllUsers);

// ✅ NEW: Search users by name or email
router.get("/search", protect, async (req, res) => {
  try {
    const searchTerm = req.query.q; // Get search query from frontend
    if (!searchTerm) {
      return res.status(400).json({ error: "Missing search query" });
    }

    // Search for users by name or email (case-insensitive match)
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("-password"); // Exclude passwords for security

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
