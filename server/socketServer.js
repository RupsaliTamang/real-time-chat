import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Message from "../models/Message.js"; // adjust path if needed
import express from "express";

dotenv.config();

// Minimal Express app just for Socket.IO
const app = express();
app.use(express.json());

// Wrap with HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, { cors: { origin: "*" } });

// Track users by socket ID
const onlineUsers = new Map();

io.on("connection", async (socket) => {

  // ===== When a user joins =====
  socket.on("join", async (username) => {
    socket.username = username;
    onlineUsers.set(socket.id, username);

    // Emit updated online users to all clients
    io.emit("onlineUsers", [...new Set(onlineUsers.values())]);

    // Send full chat history
    const messages = await Message.find().sort({ createdAt: 1 });
    socket.emit("chatHistory", messages);
  });

  // ===== When a user sends a message =====
  socket.on("sendMessage", async (msg) => {
    const saved = await Message.create(msg); // { sender, text, createdAt }
    io.emit("receiveMessage", saved);
  });

  // ===== Typing indicator =====
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.username);
  });

  // ===== Disconnect =====
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", [...new Set(onlineUsers.values())]);
  });
});

// Listen on separate port
server.listen(process.env.PORT_SOCKET || 5001, () =>
  console.log(`Socket server running on port ${process.env.PORT_SOCKET || 5001}`)
);
