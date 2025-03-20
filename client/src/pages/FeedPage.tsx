import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiImage, FiSend, FiRefreshCw } from "react-icons/fi";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [signedImageUrl, setSignedImageUrl] = useState("");
  const [useSignedUrl, setUseSignedUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const response = await axiosInstance.get("/posts");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt for the image");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl(""); // Clear previous image
    setSignedImageUrl("");
    setUseSignedUrl(false);

    try {
      const response = await axiosInstance.post(
        "/posts/generate-image",
        { prompt },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );

      console.log("Image generation response:", response.data);
      
      // Handle both URL types from the backend
      if (response.data) {
        if (response.data.imageUrl) {
          setImageUrl(response.data.imageUrl);
        }
        if (response.data.signedUrl) {
          setSignedImageUrl(response.data.signedUrl);
        }
      } else {
        setError("Received invalid response from server");
      }
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Failed to generate image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleImageUrlType = () => {
    setUseSignedUrl(!useSignedUrl);
  };

  const getCurrentImageUrl = () => {
    if (useSignedUrl && signedImageUrl) {
      return signedImageUrl;
    }
    return imageUrl;
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    try {
      const postData: { title: string; content: string; imageUrl?: string } = {
        title,
        content,
      };
  
      // Use the currently displayed image URL
      const currentImageUrl = getCurrentImageUrl();
      if (currentImageUrl) {
        postData.imageUrl = currentImageUrl;
      }
  
      await axiosInstance.post("/posts", postData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
  
      alert("Post created successfully!");
      setTitle("");
      setContent("");
      setImageUrl("");
      setSignedImageUrl("");
      setPrompt("");
      setError("");
  
      // Refresh Posts After New Post
      fetchPosts();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Error creating post. Try again."
      );
    }
  };

  // Handle image load error by trying the other URL type
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load with current URL type");
    
    if (!useSignedUrl && signedImageUrl) {
      console.log("Trying signed URL instead");
      setUseSignedUrl(true);
    } else if (useSignedUrl && imageUrl) {
      console.log("Trying public URL instead");
      setUseSignedUrl(false);
    } else {
      console.error("Both URL types failed");
      setError("Failed to load image with either URL type");
      (e.target as HTMLImageElement).style.display = 'none';
    }
  };

  return (
    <div className="min-h-screen flex text-white bg-gradient-to-r from-blue-600 to-purple-600">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white bg-opacity-65 backdrop-blur-lg px-6 py-2 flex justify-between items-center shadow-md z-50">
        <h1 className="text-xl font-bold text-gray-800">DaliHub</h1>
        <button onClick={handleLogout} className="text-gray-800 hover:text-gray-600 transition flex items-center space-x-1">
          <FiLogOut className="text-xl" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-4 bottom-4 w-64 bg-white bg-opacity-65 backdrop-blur-lg rounded-xl p-4 shadow-md max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <div className="flex items-center space-x-3 mb-6">
          <img src="https://via.placeholder.com/50" alt="Profile" className="w-12 h-12 rounded-full" />
          <p className="text-gray-900 font-semibold">Your Profile</p>
        </div>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="flex items-center space-x-3">
              <img src={user.profileImage || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full" />
              <p className="text-gray-800">{user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 mt-16 px-8 pb-8">
        {/* Create Post Section */}
        <div className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-transparent max-w-lg w-full mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Create a Post</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmitPost}>
            <input 
              type="text" 
              placeholder="Post Title" 
              className="w-full p-2 border rounded mb-2" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
            <textarea 
              placeholder="Write something..." 
              className="w-full p-2 border rounded mb-2" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required
            />
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Generate AI Image (Optional)</h3>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Enter a prompt for AI image" 
                  className="flex-1 p-2 border rounded" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={handleGenerateImage} 
                  disabled={loading || !prompt.trim()} 
                  className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading ? "..." : <FiImage />}
                </button>
              </div>
            </div>
            
            {(imageUrl || signedImageUrl) && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">
                    Using {useSignedUrl ? "signed" : "public"} URL
                  </p>
                  {imageUrl && signedImageUrl && (
                    <button
                      type="button"
                      onClick={toggleImageUrlType}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    >
                      <FiRefreshCw className="mr-1" /> Try other URL
                    </button>
                  )}
                </div>
                <img 
                  src={getCurrentImageUrl()} 
                  alt="Generated" 
                  className="mt-2 rounded shadow-md w-full h-40 object-cover" 
                  onError={handleImageError}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-green-500 text-white p-2 rounded mt-4 flex items-center justify-center"
            >
              <FiSend className="mr-2" /> Submit Post
            </button>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {posts.length === 0 ? (
            <div className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg text-center">
              <p className="text-gray-800">No posts yet. Be the first to create one!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white bg-opacity-50 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-transparent max-w-lg w-full mb-6">
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post Image" 
                    className="w-full h-40 object-cover rounded-md mb-4" 
                    onError={(e) => {
                      console.error("Post image failed to load:", post.imageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
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

export default FeedPage;