import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string; 
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axiosInstance
      .get("/posts")
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
      <h1 className="text-3xl font-bold text-center">Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg">
            {post.imageUrl && ( // ✅ If there's an image, display it
              <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded-md mb-4" />
            )}
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="text-gray-200">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
