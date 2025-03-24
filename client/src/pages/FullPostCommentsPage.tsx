import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiPlusCircle, FiUsers, FiHome, FiSend, FiAlertTriangle, FiHeart, FiMessageCircle, FiMessageSquare } from "react-icons/fi";
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
  username: string;
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
  const [commentAuthors, setCommentAuthors] = useState<{ [key: string]: User }>({});
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
  
    fetchPost();
    fetchComments(1);
    fetchUsers();
  
    if (userId) {
      axiosInstance
        .get(`/users/${userId}`)
        .then((res) => setCurrentUser(res.data))
        .catch((err) => console.error("Failed to fetch current user", err));
    }
  }, [postId]);


  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      const filtered = userId
        ? res.data.filter((u: User) => u._id !== userId)
        : res.data;
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };
  
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
      res.data.comments.forEach(async (comment: Comment) => {
        if (!commentAuthors[comment.senderId]) {
          try {
            const userRes = await axiosInstance.get(`/users/${comment.senderId}`);
            setCommentAuthors((prev) => ({
              ...prev,
              [comment.senderId]: userRes.data,
            }));
          } catch (err) {
            console.error("Failed to fetch comment author", err);
          }
        }
      });
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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

  if (!post) return <p className="text-white p-4">Loading post...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white flex">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 flex justify-between items-center shadow-lg z-50"
      >
        <button
          onClick={() => navigate("/posts")}
          className="text-2xl font-bold text-white tracking-wide hover:underline hover:text-purple-300 transition"
        >
          DaliHub
        </button>

        <div className="flex items-center space-x-6">
          <button
            onClick={handleLogout}
            className="text-white hover:text-gray-300 transition flex items-center space-x-2"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>

  
      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-16 left-4 bottom-4 w-64 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto"
      >
        {currentUser && (
          <Link
            to={`/profile/${currentUser._id}`}
            className="flex items-center space-x-3 mb-8 p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-md hover:bg-opacity-30 transition"
          >
            <img
              src={currentUser.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-purple-300"
            />
            <p className="text-white font-semibold">{currentUser.username}</p>
          </Link>
        )}
        <div className="mb-6">
          <button
            onClick={() => navigate("/posts")}
            className="flex items-center space-x-2 mb-3 text-gray-300 hover:text-white transition"
          >
            <FiHome className="text-lg" />
            <span className="font-medium">Feed</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-300">
            <FiUsers className="text-lg" />
            <span className="font-medium">Community</span>
          </div>
        </div>  
        <div className="pt-4 border-t border-white border-opacity-20">
          <h3 className="text-sm uppercase text-gray-300 font-medium mb-3">
            Explore Users
          </h3>
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user._id}
                className="flex items-center space-x-3 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <img
                  src={user.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full border border-purple-300"
                />
                <Link
                  to={`/profile/${user._id}`}
                  className="text-white hover:underline"
                >
                  {user.username}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
  
      {/* Main Content */}
      <div className="flex-1 ml-72 p-10">
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
                      author.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt="Author"
                    className="w-10 h-10 rounded-full border border-purple-300"
                  />
                  <div>
                    <p className="text-white font-medium">{author.username}</p>
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
              <div className="flex items-center space-x-3 mb-2">
                {commentAuthors[comment.senderId] && (
                  <Link
                    to={`/profile/${comment.senderId}`}
                    className="flex items-center space-x-2 hover:opacity-80 transition"
                  >
                    <img
                      src={commentAuthors[comment.senderId].profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt="Commenter"
                      className="w-8 h-8 rounded-full border border-purple-300"
                    />
                    <p className="text-sm text-white font-medium">
                      {commentAuthors[comment.senderId].username}
                    </p>
                  </Link>
                )}
              </div>
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
      </div>
    </div>
  );
};

export default FullPostCommentsPage;
