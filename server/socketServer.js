import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Message from "./models/Message.js"; // message schema

dotenv.config();

// Minimal Express for Socket.IO
const app = http.createServer();
const io = new Server(app, {
  cors: { origin: "*" },
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected (Socket Server)"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Track online users (username list)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New connection:", socket.id);

  // ==== When a user joins ====
  socket.on("join", async (username) => {
    socket.username = username;
    onlineUsers.set(socket.id, username);

    // send updated online users list
    io.emit("onlineUsers", [...new Set(onlineUsers.values())]);

    // send full chat history to the joining user
    try {
      const history = await Message.find().sort({ createdAt: 1 });
      socket.emit("chatHistory", history);
    } catch (err) {
      console.error("🛑 Error loading chat history:", err);
    }
  });

  // ==== When a message is sent ====
  socket.on("sendMessage", async (msg) => {
    try {
      // save to DB
      const saved = await Message.create(msg); // expects {sender, text, createdAt}

      // broadcast to all clients (including sender)
      io.emit("receiveMessage", saved);
    } catch (err) {
      console.error("🛑 Message save/fail:", err);
    }
  });

  // Typing indicator (optional)
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.username);
  });

  // ==== User disconnects ====
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", [...new Set(onlineUsers.values())]);
  });
});

// start on socket port
const PORT = process.env.PORT_SOCKET || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});
