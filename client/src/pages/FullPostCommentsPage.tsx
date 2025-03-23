import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiEdit,
  FiTrash,
} from "react-icons/fi";
import { motion } from "framer-motion";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  senderId: string;
  deleting?: boolean;
  likes?: string[];
  commentCount?: number;
}

interface Comment {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

const FullPostCommentsPage: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchPost();
    fetchComments(1);
  }, [postId]);

  const fetchPost = async () => {
    try {
        const res = await axiosInstance.get(`/posts/${postId}`);
        setPost(res.data);
      
        const userRes = await axiosInstance.get(`/users/${res.data.senderId}`);
        setAuthor(userRes.data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      }
  };

  const fetchComments = async (page: number) => {
    try {
      const res = await axiosInstance.get(
        `/comments/post/${postId}?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data.comments);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axiosInstance.post(
        "/comments",
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments(currentPage);
      fetchPost(); // update comment count
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleToggleLike = async () => {
    if (!post) return;

    try {
      await axiosInstance.patch(`/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.likes?.includes(userId || "")
                ? prev.likes?.filter((id) => id !== userId)
                : [...(prev.likes || []), userId!],
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    try {
      await axiosInstance.delete(`/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost((prev) => (prev ? { ...prev, deleting: true } : prev));
      setTimeout(() => navigate("/feed"), 500);
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete the post. Try again.");
    }
  };

  const isPostAuthor = () => post?.senderId === userId;

  if (!post) return <p className="text-white p-4">Loading post...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-6">
      <motion.div
        className={`max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white border-opacity-10 mb-8 transition-all duration-300 ${
          post.deleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {author && (
              <Link
                to={`/profile/${author._id}`}
                className="flex items-center space-x-3"
              >
                <img
                  src={
                    author.profileImage || "https://via.placeholder.com/40"
                  }
                  alt="Author"
                  className="w-10 h-10 rounded-full border border-purple-300"
                />
                <div>
                  <p className="text-white font-medium">{author.name}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            )}
          </div>


        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
        <p className="text-gray-200 mb-4">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-64 object-cover rounded-xl shadow-md border border-white border-opacity-10 mb-4"
          />
        )}

        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleLike}
            className="flex items-center space-x-1 text-white hover:text-red-400 transition"
          >
            <FiHeart
              className={`text-xl transition ${
                post.likes?.includes(userId || "")
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            />
            <span className="text-sm">{post.likes?.length || 0}</span>
          </button>
          <div className="flex items-center space-x-1 text-white hover:text-purple-400 transition">
            <FiMessageCircle className="text-xl text-gray-300" />
            <span className="text-sm">{post.commentCount || 0}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h3 className="text-xl font-semibold mb-2">Comments</h3>

        {comments.map((comment) => (
          <motion.div
            key={comment._id}
            className="bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-100">{comment.content}</p>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </motion.div>
        ))}

        <div className="flex justify-between items-center mt-4 space-x-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => fetchComments(currentPage - 1)}
            className="px-3 py-1 bg-purple-600 rounded-lg disabled:bg-opacity-30"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => fetchComments(currentPage + 1)}
            className="px-3 py-1 bg-purple-600 rounded-lg disabled:bg-opacity-30"
          >
            Next
          </button>
        </div>

        <div className="mt-6 flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 p-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-xl text-white focus:outline-none"
          />
          <button
            onClick={handleAddComment}
            className="bg-purple-600 hover:bg-purple-700 p-3 rounded-xl text-white flex items-center justify-center"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullPostCommentsPage;
