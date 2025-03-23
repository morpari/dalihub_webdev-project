const User = require("../models/user");
const multer = require("multer");
const { bucket } = require("../config/firebase");

const upload = multer({ storage: multer.memoryStorage() });

// GET: Get user by ID (Protected)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id username profileImage");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Get all users (Protected)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id username profileImage");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PUT: Update username and/or profile image
const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.params.id;
    console.log("👀 Uploaded file:", req.file);

    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }

    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    let profileImageUrl;

    if (req.file) {
      const fileName = `profile-images/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });

      profileImageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(fileName)}?alt=media`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      },
      {
        new: true,
        select: "_id username profileImage",
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUserProfile,
};
