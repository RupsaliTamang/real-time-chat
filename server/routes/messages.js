import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Get all messages (sorted by time)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Post a new message
router.post("/", async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ msg: "Sender and text are required" });
    }

    const msg = await Message.create({ sender, text });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
