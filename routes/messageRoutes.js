const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageController");

// Send a new message
router.post("/", protect, sendMessage);

// Get all messages for a given chat
router.get("/:chatId", protect, getAllMessages);

module.exports = router;
