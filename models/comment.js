const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Comment', CommentSchema);