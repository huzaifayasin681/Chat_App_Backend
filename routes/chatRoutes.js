const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
} = require("../controllers/chatController");

// Access or create 1-on-1 chat
router.post("/", protect, accessChat);

// Fetch all chats for logged-in user
router.get("/", protect, fetchChats);

// Create a group chat
router.post("/group", protect, createGroupChat);

// Rename group chat
router.put("/rename", protect, renameGroupChat);

// Add user to group chat
router.put("/groupadd", protect, addToGroupChat);

// Remove user from group chat
router.put("/groupremove", protect, removeFromGroupChat);

module.exports = router;
