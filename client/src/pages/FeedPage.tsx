import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut } from "react-icons/fi"; // Logout icon

interface Post {
  _id: string;
  senderId: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface User {
  _id: string;
  username: string;
  profileImage?: string;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postAuthors, setPostAuthors] = useState<{ [key: string]: User }>({}); // ✅ Post creators state
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // ✅ Fetch all posts
    axiosInstance
      .get("/posts")
      .then((response) => {
        console.log("Fetched posts:", response.data);
        setPosts(response.data.posts);

        // ✅ Fetch post authors' details
        response.data.posts.forEach((post: Post) => {
          if (!postAuthors[post.senderId]) {
            axiosInstance
              .get(`/users/${post.senderId}`)
              .then((userResponse) => {
                setPostAuthors((prevAuthors) => ({
                  ...prevAuthors,
                  [post.senderId]: userResponse.data,
                }));
              })
              .catch((error) => console.error("Error fetching post author:", error));
          }
        });
      })
      .catch((error) => console.error("Error fetching posts:", error));

    // ✅ Fetch all users
    axiosInstance
      .get("/users")
      .then((response) => {
        setUsers(response.data.filter((user: User) => user._id !== userId));
      })
      .catch((error) => console.error("Error fetching users:", error));

    // ✅ Fetch logged-in user details
    if (userId) {
      axiosInstance
        .get(`/users/${userId}`)
        .then((response) => setCurrentUser(response.data))
        .catch((error) => console.error("Error fetching current user:", error));
    }
  }, [navigate, userId]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosInstance.post("/auth/logout", { token: refreshToken });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex text-white" style={{ background: "linear-gradient(to right, #2575fc, #ff00cc)" }}>
      
      {/* ✅ Top Navigation Bar */}
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

      {/* ✅ Sidebar with Users */}
      <div className="fixed top-16 left-4 bottom-4 w-64 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-4 shadow-md max-h-[calc(100vh-80px)] overflow-y-auto">
        <h3 className="text-gray-800 font-semibold mb-3">Users</h3>
        <div className="space-y-4">
          {users.map((user) => (
            <Link key={user._id} to={`/profile/${user._id}`} className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition">
              <img src={user.profileImage || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full" />
              <p className="text-gray-800 font-medium">{user.username}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ✅ Posts Section */}
      <div className="flex-1 flex justify-center mt-20 px-8 pb-8">
        <div className="w-full max-w-2xl h-[calc(100vh-100px)] overflow-y-auto">
          {posts.length > 0 ? (
            posts.map((post) => {
              const author = postAuthors[post.senderId]; // ✅ Get post creator

              return (
                <div key={post._id} className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-transparent mb-6">
                  {/* ✅ Post Author Info */}
                  {author && (
                    <div className="flex items-center space-x-3 mb-4">
                      <Link to={`/profile/${author._id}`} className="flex items-center space-x-2 hover:opacity-80">
                        <img src={author.profileImage || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full border border-gray-300" />
                        <span className="text-gray-900 font-medium">{author.username}</span>
                      </Link>
                    </div>
                  )}

                  {/* ✅ Post Content */}
                  {post.imageUrl && <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded-md mb-4" />}
                  <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-gray-800">{post.content}</p>
                </div>
              );
            })
          ) : (
            <h3 className="text-gray-900 text-center">No posts yet...</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
