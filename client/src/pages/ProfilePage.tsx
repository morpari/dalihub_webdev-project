import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  FiHeart,
  FiMessageCircle,
  FiLogOut,
  FiEdit2,
  FiTrash,
  FiAlertTriangle,
  FiUpload,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  deleting?: boolean;
  likes?: string[];
  commentCount?: number;
}

interface User {
  _id: string;
  username: string;
  profileImage?: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const userId = localStorage.getItem("userId");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    axiosInstance.get(`/users/${userId}`).then((res) => setCurrentUser(res.data)).catch(console.error);

    axiosInstance.get(`/users/${id}`).then((res) => {
      setUser(res.data);
      setNewUsername(res.data.username);
    }).catch(console.error);

    fetchUserPosts();
  }, [id, navigate, userId]);

  const fetchUserPosts = () => {
    axiosInstance.get(`/posts/user/${id}`).then((res) => {
      setPosts(res.data.posts);
    }).catch(console.error);
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await axiosInstance.patch(`/posts/${postId}/like`);
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

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosInstance.post("/auth/logout", { token: refreshToken });
      }
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    if (!newUsername.trim()) return setError("Username cannot be empty.");
  
    const formData = new FormData();
    formData.append("username", newUsername);
    if (uploadImage) formData.append("upload", uploadImage);
  

    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`${key}:`, value);
    }
  
    try {
      const res = await axiosInstance.put(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data);
      setIsEditing(false);
      setUploadImage(null);
      setPreviewImage(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };
  

  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!postToDelete) return;
    try {
      await axiosInstance.delete(`/posts/${postToDelete}`);
      setPosts(prev => prev.map(p => p._id === postToDelete ? { ...p, deleting: true } : p));
      setTimeout(() => fetchUserPosts(), 300);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (!user) return <h2 className="text-center text-gray-800">Loading...</h2>;

  return (
    <div className="min-h-screen flex text-white" style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)" }}>
      {/* Top Bar */}
      <motion.div className="fixed top-0 left-0 w-full bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 flex justify-between items-center shadow-lg z-50">
      <button
          onClick={() => navigate("/posts")}
          className="text-2xl font-bold text-white tracking-wide hover:underline hover:text-purple-300 transition"
        >
          DaliHub
        </button>
        <div className="flex items-center space-x-6">
          <button onClick={handleLogout} className="text-white hover:text-gray-300 transition flex items-center space-x-2">
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
          {currentUser && (
            <Link to={`/profile/${currentUser._id}`} className="flex items-center space-x-2 hover:opacity-80">
              <img src={currentUser.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile" className="w-8 h-8 rounded-full border border-white" />
              <span className="text-white font-medium text-sm">{currentUser.username}</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Profile Sidebar */}
      <motion.div className="fixed top-16 right-4 bottom-4 w-72 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-lg flex flex-col items-center text-center space-y-4">
        <img src={previewImage || user.profileImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile" className="w-28 h-28 rounded-full border-4 border-purple-300 shadow-md" />
        <h2 className="text-xl font-semibold text-white">{user.username}</h2>
        {userId === user._id && (
          <button onClick={() => setIsEditing(true)} className="w-full bg-purple-600 bg-opacity-70 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-100 transition">
            <FiEdit2 className="text-lg" />
            <span>Edit Profile</span>
          </button>
        )}
      </motion.div>

      {/* Posts */}
      <div className="flex-1 flex flex-col items-center mt-20 px-8 pb-8 mr-80">
        <motion.div className="w-full max-w-2xl">
          {posts.length === 0 ? (
            <h3 className="text-white text-center mt-10">No posts yet...</h3>
          ) : (
            posts.map((post, index) => (
              <motion.div key={post._id} className={`bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white border-opacity-10 mb-6 transition-all duration-300 ${post.deleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full h-64 object-cover rounded-xl shadow-md border border-white border-opacity-10 mb-4" />
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                <p className="text-gray-200 mb-4">{post.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleToggleLike(post._id)} className="flex items-center space-x-1 text-white hover:text-red-400 transition">
                      <FiHeart className={`text-xl ${post.likes?.includes(userId || "") ? "text-red-500" : "text-gray-400"}`} />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    <button onClick={() => navigate(`/posts/${post._id}/comments`)} className="flex items-center space-x-1 text-white hover:text-purple-400 transition">
                      <FiMessageCircle className="text-xl text-gray-300" />
                      <span className="text-sm">{post.commentCount || 0}</span>
                    </button>
                  </div>
                  {userId === user._id && (
                    <button onClick={() => confirmDeletePost(post._id)} className="bg-red-500 text-white py-1 px-3 rounded-lg flex items-center space-x-1 hover:bg-red-600 transition-colors">
                      <FiTrash className="text-base" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)}>
            <motion.div className="bg-white p-6 rounded-lg shadow-lg w-96" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Profile</h2>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full border text-gray-900 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="New username" />
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">Upload new profile image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
              </div>
              {previewImage && (
                <img src={previewImage} alt="Preview" className="mt-3 w-20 h-20 rounded-full border" />
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition" onClick={handleUpdateProfile}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelDelete}>
            <motion.div className="bg-white p-6 rounded-lg shadow-lg w-96" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center space-x-3 text-red-500 mb-4">
                <FiAlertTriangle className="text-2xl" />
                <h2 className="text-lg font-bold">Delete Post</h2>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition" onClick={cancelDelete}>Cancel</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" onClick={handleDeleteConfirmed}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
