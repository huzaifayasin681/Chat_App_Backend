require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import your socket file
const socketHandlers = require("./sockets/socket");

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: "https://chat-app-frontend-one-ebon.vercel.app", // Update with your Vercel frontend URL
    methods: "GET, POST, PUT, DELETE",
    credentials: true, // If using cookies
  })
);

app.use(express.json());

// Connect to database
connectDB();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Pass the io instance to our socket handlers
socketHandlers(io);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));


app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
