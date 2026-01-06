import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: "Please provide username and password" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    res.status(201).json({
      msg: "Registered successfully",
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error("REGISTER ERROR", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

  
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("LOGIN ERROR", err);
    res.status(500).json({ msg: "Server error" });
  }
};
