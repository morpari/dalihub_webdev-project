import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiEdit2 } from "react-icons/fi"; // Import edit icon

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null); // ✅ Logged-in user
  const [isEditing, setIsEditing] = useState(false); // ✅ Toggle for edit mode
  const [newUsername, setNewUsername] = useState(""); // ✅ Updated username
  const [error, setError] = useState(""); // ✅ Error handling

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    // ✅ Fetch logged-in user for navbar
    axiosInstance
      .get(`/users/${userId}`)
      .then((response) => setCurrentUser(response.data))
      .catch((error) => console.error("Error fetching logged-in user:", error));

    // ✅ Fetch the profile being viewed
    axiosInstance
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
        setNewUsername(response.data.username); // ✅ Set default username for editing
      })
      .catch((error) => console.error("Error fetching user:", error));

    // ✅ Fetch posts of the viewed profile
    axiosInstance
      .get(`/posts/user/${id}`)
      .then((response) => setPosts(response.data.posts))
      .catch((error) => console.error("Error fetching user posts:", error));
  }, [id, navigate, userId]);

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

  // ✅ Handle updating the username
  const handleUpdateUsername = async () => {
    setError(""); // Clear previous errors
    if (!newUsername.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (newUsername === user?.username) {
      setError("This is already your username.");
      return;
    }
    try {
      const response = await axiosInstance.put(`/users/${userId}`, {
        username: newUsername,
      });
      setUser(response.data); // Update user in UI
      setIsEditing(false); // Close edit mode
    } catch (error: any) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  if (!user) return <h2 className="text-center text-gray-800">Loading...</h2>;

  return (
    <div className="min-h-screen flex text-white" style={{ background: "linear-gradient(to right, #2575fc, #ff00cc)" }}>
      
      {/* ✅ Top Navigation Bar */}
      <div className="fixed top-0 left-0 w-full bg-white bg-opacity-80 backdrop-blur-lg px-6 py-2 flex items-center justify-between shadow-md z-50">
        {/* ✅ Left Side: App Name & Logout */}
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-800">DaliHub</h1>
          <button onClick={handleLogout} className="text-gray-800 hover:text-gray-600 transition flex items-center space-x-1">
            <FiLogOut className="text-xl" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* ✅ Right Side: Show Logged-In User in Navbar */}
        {currentUser && (
          <Link to={`/profile/${currentUser._id}`} className="flex items-center space-x-2 hover:opacity-80">
            <img src={currentUser.profileImage || "https://via.placeholder.com/50"} alt="Profile" className="w-8 h-8 rounded-full border border-gray-300" />
            <span className="text-gray-800 font-medium text-sm">{currentUser.username}</span>
          </Link>
        )}
      </div>

      {/* ✅ Profile Info Section (Top-Right) */}
      <div className="fixed top-16 right-4 bg-white bg-opacity-90 backdrop-blur-lg p-6 rounded-xl shadow-lg w-72">
        <img 
          src={user.profileImage || "https://via.placeholder.com/150"} 
          alt="Profile" 
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
        />
        <h2 className="text-center text-2xl font-semibold text-gray-900">{user.username}</h2>

        {/* ✅ Edit Profile Button (Only if logged-in user is viewing their own profile) */}
        {userId === user._id && (
          <button 
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
            onClick={() => setIsEditing(true)}
          >
            <FiEdit2 className="text-lg" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/*Edit Profile Shown when edit */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Change Username</h2>
            
            {/* ✅ Username Input */}
            <input 
              type="text" 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
              className="w-full border text-gray-900 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
              placeholder="Enter new username" 
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* ✅ Buttons */}
            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={handleUpdateUsername}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Placeholder for Posts Section */}
      <div className="flex-1 flex justify-center mt-20 px-8 pb-8">
        <div className="w-full max-w-2xl h-[calc(100vh-100px)] overflow-y-auto">
          <h3 className="text-gray-900 text-center">User's posts go here...</h3>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
