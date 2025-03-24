import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiPlusCircle, FiUsers, FiHome, FiEdit, FiTrash, FiAlertTriangle, FiHeart, FiMessageCircle, FiMessageSquare } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PostCreator from "../components/PostCreator";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  createdAt: string;
  senderId: string;
  deleting?: boolean;
  likes?: string[];
  commentCount?: number;
}

interface User {
  _id: string;
  username: string;
  profileImage?: string;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postAuthors, setPostAuthors] = useState<{ [key: string]: User }>({});
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchPosts();
    fetchUsers();
  
    //Fetch current user
    if (userId) {
      axiosInstance
        .get(`/users/${userId}`)
        .then((res) => setCurrentUser(res.data))
        .catch((err) => console.error("Failed to fetch current user", err));
    }
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/posts");
      setPosts(res.data.posts);

      res.data.posts.forEach((post: Post) => {
        if (!postAuthors[post.senderId]) {
          axiosInstance.get(`/users/${post.senderId}`).then((userRes) => {
            setPostAuthors((prev) => ({
              ...prev,
              [post.senderId]: userRes.data,
            }));
          });
        }
      });
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await axiosInstance.patch(`/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes?.includes(userId || "")
                  ? post.likes?.filter((id) => id !== userId)
                  : [...(post.likes || []), userId!],
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };
  

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      const filtered = userId
        ? response.data.filter((u: User) => u._id !== userId)
        : response.data;
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handlePostCreated = () => {
    fetchPosts();
    setShowPostCreator(false);
    setSelectedPost(null);
    setIsEditing(false);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsEditing(true);
    setShowPostCreator(true);
  };

  const handleCancelEdit = () => {
    setShowPostCreator(false);
    setSelectedPost(null);
    setIsEditing(false);
  };

  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!postToDelete) return;
    try {
      await axiosInstance.delete(`/posts/${postToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(prevPosts => prevPosts.map(p => 
        p._id === postToDelete 
          ? {...p, deleting: true} 
          : p
      ));
      
      setTimeout(() => {
        fetchPosts();
      }, 300);
      
      // Close the modal
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete the post. Try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const isPostAuthor = (post: Post) => post.senderId === userId;

  const backgroundStyle = {
    background: "linear-gradient(to right, #6a11cb, #2575fc)",
  };

  return (
    <div className="min-h-screen flex text-white" style={backgroundStyle}>
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 flex justify-between items-center shadow-lg z-50"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide">DaliHub</h1>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => {
              setSelectedPost(null);
              setIsEditing(false);
              setShowPostCreator(true);
            }}
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

      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
          <h3 className="text-sm uppercase text-gray-300 font-medium mb-3">Explore Users</h3>
          <div className="space-y-4">
            {users.map((user) => (
              <motion.div
                key={user._id}
                className="flex items-center space-x-3 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <img src={user.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile" className="w-10 h-10 rounded-full border border-purple-300" />
                <Link to={`/profile/${user._id}`} className="text-white hover:underline">
                  {user.username}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center mt-20 px-8 pb-8 ml-64">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {posts.map((post, index) => {
            const author = postAuthors[post.senderId];
            return (
              <motion.div
                key={post._id}
                className={`bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white border-opacity-10 mb-6 transition-all duration-300 ${post.deleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {author && (
                      <Link to={`/profile/${author._id}`} className="flex items-center space-x-3">
                        <img src={author.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Author" className="w-10 h-10 rounded-full border border-purple-300" />
                        <div>
                          <p className="text-white font-medium">{author.username}</p>
                          <p className="text-xs text-gray-300">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    )}
                  </div>

                  {isPostAuthor(post) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="bg-purple-500 bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                        title="Edit post"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => confirmDeletePost(post._id)}
                        className="bg-red-500 bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                        title="Delete post"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                <p className="text-gray-200 mb-4">{post.content}</p>

                {post.imageUrl && (
                  <div>
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-xl shadow-md border border-white border-opacity-10"
                    />
                    {post.imagePrompt && (
                      <div className="mt-2 p-3 bg-black bg-opacity-30 backdrop-blur-sm rounded-xl text-gray-200 italic flex items-start">
                        <FiMessageSquare className="mr-2 mt-1 text-purple-400 flex-shrink-0" />
                        <p className="text-sm">"{post.imagePrompt}"</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleLike(post._id)}
                      className="flex items-center space-x-1 text-white hover:text-red-400 transition"
                    >
                      <FiHeart
                        className={`text-xl transition ${
                          post.likes?.includes(userId || "") ? "text-red-500" : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/posts/${post._id}/comments`)}
                      className="flex items-center space-x-1 text-white hover:text-purple-400 transition"
                    >
                      <FiMessageCircle className="text-xl text-gray-300" />
                      <span className="text-sm">{post.commentCount || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {showPostCreator && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelEdit}
          >
            <motion.div
              className="relative max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PostCreator 
                onPostCreated={handlePostCreated} 
                onCancel={handleCancelEdit} 
                postToEdit={selectedPost} 
                isEditing={isEditing}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
          >
            <motion.div 
              className="bg-white bg-opacity-90 backdrop-blur-lg p-6 rounded-xl shadow-lg w-96"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 text-red-500 mb-4">
                <FiAlertTriangle className="text-2xl" />
                <h2 className="text-xl font-bold text-gray-800">Delete Post</h2>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" 
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" 
                  onClick={handleDeleteConfirmed}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;