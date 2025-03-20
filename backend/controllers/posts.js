const Post = require('../models/post');
const OpenAI = require("openai");
const axios = require("axios");
const { bucket } = require("../config/firebase");
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateImage = async (req, res) => {
  try {
    console.log("Image generation request received");
    const { prompt } = req.body;
    
    // Validate prompt
    if (!prompt) {
      console.log("Error: No prompt provided");
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return res.status(500).json({ error: "Server configuration error (API key missing)" });
    }

    console.log("Calling OpenAI API with prompt:", prompt);
    
    // Call OpenAI API
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Validate OpenAI response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      console.error("Invalid response from OpenAI:", response);
      return res.status(500).json({ error: "Failed to generate image - invalid API response" });
    }

    const openAiImageUrl = response.data[0].url;
    console.log("Generated image URL from OpenAI:", openAiImageUrl);

    try {
      // Download image from OpenAI
      console.log("Downloading image from OpenAI...");
      const imageResponse = await axios.get(openAiImageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(imageResponse.data, "binary");

      // Validate Firebase bucket
      if (!bucket) {
        console.error("Firebase bucket is not configured");
        return res.status(500).json({ error: "Server configuration error (storage not configured)" });
      }

      // Upload to Firebase
      console.log("Uploading to Firebase Storage...");
      const fileName = `generated-images/${Date.now()}-${req.user.userId}.png`;
      const file = bucket.file(fileName);
      
      await file.save(imageBuffer, { 
        contentType: "image/png",
        metadata: {
          firebaseStorageDownloadTokens: Date.now().toString(),
        }
      });

      // Get public URL
      const firebaseImageUrl = await getDownloadURL(file);
      console.log("Image successfully uploaded to Firebase:", firebaseImageUrl);

      res.status(200).json({ imageUrl: firebaseImageUrl });
    } catch (downloadError) {
      console.error("Error processing or storing the image:", downloadError);
      return res.status(500).json({ error: "Failed to process generated image" });
    }
  } catch (error) {
    console.error("Error in generateImage:", error);
    
    // Provide more specific error messages based on error type
    if (error.response) {
      console.error("API response error:", error.response.status, error.response.data);
      // Handle OpenAI API specific errors
      if (error.response.status === 401) {
        return res.status(500).json({ error: "API authentication failed - check API key" });
      } else if (error.response.status === 429) {
        return res.status(500).json({ error: "API rate limit exceeded" });
      }
    }
    
    res.status(500).json({ 
      error: "Failed to generate image", 
      message: error.message 
    });
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
    const { title, content, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = new Post({
      senderId: req.user.userId,
      title,
      content,
      imageUrl,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
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