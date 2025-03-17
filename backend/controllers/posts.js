const Post = require('../models/post');
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data || !response.data.data || !response.data.data[0].url) {
      return res.status(500).json({ error: "Failed to generate image" });
    }

    res.status(200).json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error retrieving posts" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error retrieving post" });
  }
};

exports.getPostsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    if (!senderId) return res.status(400).json({ error: "Sender ID is required" });

    const posts = await Post.find({ senderId });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error retrieving posts by sender" });
  }
};

exports.addPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const post = new Post({
      senderId: req.user.userId,
      title,
      content,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error creating post" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized to edit this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error updating post" });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
  generateImage,
};
