import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiPlusCircle, FiUsers, FiHome } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PostCreator from "../components/PostCreator";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author?: {
    name: string;
    profileImage?: string;
  };
}

interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchPosts();
    fetchUsers();
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const handlePostCreated = () => {
    fetchPosts();
    setShowPostCreator(false);
  };

  // Background gradient similar to welcome page
  const backgroundStyle = {
    background: "linear-gradient(to right, #6a11cb, #2575fc)",
  };

  return (
    <div className="min-h-screen flex text-white" style={backgroundStyle}>
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 flex justify-between items-center shadow-lg z-50"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide">DaliHub</h1>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setShowPostCreator(true)} 
            className="bg-purple-600 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-105"
          >
            <FiPlusCircle className="text-2xl" />
          </button>
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-16 left-4 bottom-4 w-64 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
      >
        <div className="flex items-center space-x-3 mb-8 p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-md">
          <img src="https://via.placeholder.com/50" alt="Profile" className="w-12 h-12 rounded-full border-2 border-purple-300" />
          <p className="text-white font-semibold">Your Profile</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3 text-gray-300">
            <FiHome className="text-lg" />
            <span className="font-medium">Feed</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <FiUsers className="text-lg" />
            <span className="font-medium">Community</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white border-opacity-20">
          <h3 className="text-sm uppercase text-gray-300 font-medium mb-3">Active Users</h3>
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div 
                key={user._id} 
                className="flex items-center space-x-3 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <img src={user.profileImage || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full border border-purple-300" />
                <p className="text-white">{user.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center mt-20 px-8 pb-8 ml-64">
        {/* Post List */}
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {Array.isArray(posts) && posts.map((post, index) => (
            <motion.div 
              key={post._id} 
              className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white border-opacity-10 mb-6 hover:bg-opacity-15 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <img src={post.author?.profileImage || "https://via.placeholder.com/40"} alt="Author" className="w-10 h-10 rounded-full border border-purple-300" />
                <div>
                  <p className="text-white font-medium">{post.author?.name || "Anonymous"}</p>
                  <p className="text-xs text-gray-300">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
              <p className="text-gray-200 mb-4">{post.content}</p>
              
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-64 object-cover rounded-xl shadow-md border border-white border-opacity-10" 
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Post Creator Modal */}
      <AnimatePresence>
        {showPostCreator && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPostCreator(false)}
          >
            <motion.div 
              className="relative max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PostCreator onPostCreated={handlePostCreated} onCancel={() => setShowPostCreator(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;