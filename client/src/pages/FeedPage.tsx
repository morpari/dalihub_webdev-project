import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut } from "react-icons/fi"; // Import a logout icon

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const currentUser = { name: "John Doe", profileImage: "https://via.placeholder.com/50" };

  useEffect(() => {
    // check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); 
      return;
    }
    axiosInstance
      .get("/posts")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));

    axiosInstance
      .get("/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosInstance.post("/auth/logout", { token: refreshToken });
      }
    //  Clear both tokens from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex text-white"
      style={{
        background: "linear-gradient(to right, #2575fc, #ff00cc)", 
      }}
    >
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white bg-opacity-65 backdrop-blur-lg px-6 py-2 flex justify-between items-center shadow-md z-50">
        {/*  App Name in Blue */}
        <h1 className="text-xl font-bold text-gray-800">DaliHub</h1>

        {/*  Minimalist Logout Icon */}
        <button
          onClick={handleLogout}
          className="text-gray-800 hover:text-gray-600 transition flex items-center space-x-1"
        >
          <FiLogOut className="text-xl" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Sidebar (Independent) */}
      <div className="fixed top-16 left-4 bottom-4 w-64 bg-white bg-opacity-65 backdrop-blur-lg rounded-xl p-4 shadow-md max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {/* Current User */}
        <div className="flex items-center space-x-3 mb-6">
          <img src={currentUser.profileImage} alt="Profile" className="w-12 h-12 rounded-full" />
          <p className="text-gray-900 font-semibold">{currentUser.name}</p>
        </div>

        {/* Scrollable User List */}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="flex items-center space-x-3">
              <img src={user.profileImage || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full" />
              <p className="text-gray-800">{user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Section (Now Separate & Scrollable) */}
      <div className="flex-1 ml-72 mt-16 px-8 pb-8">
        <div className="h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-transparent max-w-lg w-full mb-6"
            >
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded-md mb-4" />
              )}
              <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
              <p className="text-gray-800">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
