const User = require("../models/user");

// Get user by ID (Protected)
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

// Get all users (Protected)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id username profileImage");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.params.id;

    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }

    // Check if username already exists (excluding the current user)
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    // Update username
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true, select: "_id username profileImage" } // Only return necessary fields
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


module.exports = { getUserById, getAllUsers, updateUserProfile,};
