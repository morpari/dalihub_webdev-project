import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiEdit2 } from "react-icons/fi";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");

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

    axiosInstance.get(`/posts/user/${id}`).then((res) => {
      setPosts(res.data.posts);
    }).catch(console.error);
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

  const handleUpdateUsername = async () => {
    setError("");
    if (!newUsername.trim()) return setError("Username cannot be empty.");
    if (newUsername === user?.username) return setError("This is already your username.");
    try {
      const res = await axiosInstance.put(`/users/${userId}`, { username: newUsername });
      setUser(res.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  if (!user) return <h2 className="text-center text-gray-800">Loading...</h2>;

  return (
    <div className="min-h-screen flex text-white" style={{ background: "linear-gradient(to right, #2575fc, #ff00cc)" }}>
      <div className="fixed top-0 left-0 w-full bg-white bg-opacity-80 backdrop-blur-lg px-6 py-2 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-gray-800">DaliHub</h1>
          <button onClick={handleLogout} className="text-gray-800 hover:text-gray-600 transition flex items-center space-x-1">
            <FiLogOut className="text-xl" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
        {currentUser && (
          <Link to={`/profile/${currentUser._id}`} className="flex items-center space-x-2 hover:opacity-80">
            <img src={currentUser.profileImage || "https://via.placeholder.com/50"} alt="Profile" className="w-8 h-8 rounded-full border border-gray-300" />
            <span className="text-gray-800 font-medium text-sm">{currentUser.username}</span>
          </Link>
        )}
      </div>

      <div className="fixed top-16 right-4 bg-white bg-opacity-90 backdrop-blur-lg p-6 rounded-xl shadow-lg w-72">
        <img 
          src={user.profileImage || "https://via.placeholder.com/150"} 
          alt="Profile" 
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
        />
        <h2 className="text-center text-2xl font-semibold text-gray-900">{user.username}</h2>
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

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Change Username</h2>
            <input 
              type="text" 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
              className="w-full border text-gray-900 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
              placeholder="Enter new username" 
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={handleUpdateUsername}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex justify-center mt-20 px-8 pb-8">
        <div className="w-full max-w-2xl h-[calc(100vh-100px)] overflow-y-auto">
          {posts.length === 0 ? (
            <h3 className="text-white text-center mt-10">No posts yet...</h3>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-transparent mb-6">
                {post.imageUrl && <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded-md mb-4" />}
                <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                <p className="text-gray-800">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
