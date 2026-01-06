import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return res.status(400).json({ msg: "Username & password required" });

    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ msg: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashed });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, username: newUser.username });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res.status(400).json({ msg: "Username & password required" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error("Login error occurred:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
