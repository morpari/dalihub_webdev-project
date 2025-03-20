const Post = require('../models/post');
const OpenAI = require("openai");
const axios = require("axios");
const { bucket } = require("../config/firebase");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data || !response.data[0].url) {
      return res.status(500).json({ error: "Failed to generate image" });
    }

    const openAiImageUrl = response.data[0].url;

    const imageResponse = await axios.get(openAiImageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imageResponse.data, "binary");

    const fileName = `generated-images/${Date.now()}.png`;
    const file = bucket.file(fileName);
    await file.save(imageBuffer, { contentType: "image/png" });

    const firebaseImageUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;

    res.status(200).json({ imageUrl: firebaseImageUrl });

  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving post' });
  }
};

const getPostsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    if (!senderId) return res.status(400).json({ error: 'Sender ID is required' });

    const posts = await Post.find({ senderId });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving posts by sender' });
  }
};

const addPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Use authenticated user's ID
    const post = new Post({
      senderId: req.user.userId,
      title,
      content,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Ensure only the post owner can update it
    if (post.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
  generateImage
  
};