import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    online: {
      type: Boolean,
      default: false, // Track if user is currently online
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
