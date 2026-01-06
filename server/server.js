import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Detailed error logger (optional but helpful)
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ msg: "Server encountered an error", error: err.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ REST API MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('REST API running on port ${PORT}');
  });