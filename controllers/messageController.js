const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ error: "Invalid data passed into request" });
    }

    let newMessage = {
      sender: req.user.id,
      content: content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    // Populate sender and chat
    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    // Update latestMessage in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Server error while sending message." });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
exports.getAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat");

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Server error while fetching messages." });
  }
};
