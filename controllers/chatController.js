const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Create or fetch 1-on-1 chat
// @route   POST /api/chats
// @access  Private
exports.accessChat = async (req, res) => {
  /*
    Expected req.body: { userId } - the ID of the other user
    We'll find if a 1-on-1 chat already exists between the two users:
    - If it does, return it.
    - If not, create a new chat.
  */
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId parameter not sent with request" });
    }

    // Check if a 1-on-1 chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } }, // current user
        { users: { $elemMatch: { $eq: userId } } },       // other user
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate sender of latestMessage
    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (chat) {
      return res.status(200).json(chat);
    } else {
      // Create new chat
      const newChatData = {
        chatName: "sender", // You can dynamically set a name if needed
        isGroupChat: false,
        users: [req.user.id, userId],
      };
      const createdChat = await Chat.create(newChatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(201).json(fullChat);
    }
  } catch (error) {
    console.error("Error accessing chat:", error);
    return res.status(500).json({ error: "Server error while accessing chat." });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
exports.fetchChats = async (req, res) => {
  try {
    // Return all chats that contain the logged-in user
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }); // most recent first

    // Populate the sender of latestMessage inside each chat
    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email",
    });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ error: "Server error while fetching chats." });
  }
};

// @desc    Create a new group chat
// @route   POST /api/chats/group
// @access  Private
exports.createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!users || !name) {
      return res.status(400).json({ error: "Please provide group name and users." });
    }

    // users should be an array of userIds
    const parsedUsers = JSON.parse(users);

    if (parsedUsers.length < 2) {
      return res
        .status(400)
        .json({ error: "A group chat requires at least 2 users." });
    }

    // add the current user to the array
    parsedUsers.push(req.user.id);

    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: parsedUsers,
      groupAdmin: req.user.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    return res.status(500).json({ error: "Server error while creating group chat." });
  }
};

// @desc    Rename a group chat
// @route   PUT /api/chats/rename
// @access  Private
exports.renameGroupChat = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error renaming group chat:", error);
    return res.status(500).json({ error: "Server error while renaming group chat." });
  }
};

// @desc    Add user to a group chat
// @route   PUT /api/chats/groupadd
// @access  Private
exports.addToGroupChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error adding user to group chat:", error);
    return res.status(500).json({ error: "Server error while adding user to group chat." });
  }
};

// @desc    Remove user from a group chat
// @route   PUT /api/chats/groupremove
// @access  Private
exports.removeFromGroupChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error removing user from group chat:", error);
    return res.status(500).json({ error: "Server error while removing user from group chat." });
  }
};
