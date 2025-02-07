const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Initialize socket events for real-time chat
 * @param {Server} io - The Socket.IO server instance
 */
const socketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // 1) Listen for "setup" event to initialize user
    socket.on("setup", (userData) => {
      // Optionally, join a room named by the user's ID if needed for other events
      socket.join(userData._id);
      socket.emit("connected");
    });

    // 2) Join a chat room
    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    // 3) Listen for new messages and broadcast them to the chat room
    socket.on("new message", (newMessage) => {
      const chat = newMessage.chat;
      if (!chat || !chat._id) {
        return console.log("Chat or chat ID not provided in new message");
      }
      // Broadcast the new message to all sockets in the chat room except the sender
      socket.to(chat._id).emit("message received", newMessage);
    });

    // 4) (Optional) Typing event: notify others in the chat room
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing");
    });

    // 5) (Optional) Stop typing event: notify others in the chat room
    socket.on("stop typing", (chatId) => {
      socket.to(chatId).emit("stop typing");
    });

    // 6) Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = socketHandlers;
