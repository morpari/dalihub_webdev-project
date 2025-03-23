const Comment = require('../models/comment');

const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving comment' });
  }
};

const getAllCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!postId) return res.status(400).json({ error: 'Post ID is required' });

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ postId });

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving comments for post' });
  }
};


const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    // Use authenticated user's ID
    const comment = new Comment({
      postId,
      senderId: req.user.userId,
      content,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating comment' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Ensure only the comment owner can update it
    if (comment.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error updating comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Ensure only the comment owner can delete it
    if (comment.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
};

module.exports = {
  getCommentById,
  getAllCommentsForPost,
  addComment,
  updateComment,
  deleteComment,
};
