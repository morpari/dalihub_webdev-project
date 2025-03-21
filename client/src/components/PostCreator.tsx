import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiImage, FiSend, FiX, FiUpload, FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";

interface Props {
  onPostCreated: () => void;
  onCancel?: () => void;
}

const PostCreator: React.FC<Props> = ({ onPostCreated, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImageOptions, setShowImageOptions] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt for image generation");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        "/posts/generate-image",
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setImageUrl(res.data.imageUrl);
      setShowImageOptions(false); // Hide options after successful generation
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Try again.");
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadImage(e.target.files[0]);
      setImageUrl(""); // Clear generated image if uploading manually
      setShowImageOptions(false); // Hide options after successful upload
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Please enter a title for your post");
      return;
    }
    
    if (!content.trim()) {
      setError("Please enter some content for your post");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (imageUrl) formData.append("imageUrl", imageUrl);
      if (uploadImage) formData.append("upload", uploadImage);

      await axiosInstance.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset fields
      setTitle("");
      setContent("");
      setPrompt("");
      setImageUrl("");
      setUploadImage(null);
      setLoading(false);
      onPostCreated();
    } catch (err) {
      console.error("Post submission failed", err);
      setError("Post submission failed. Try again.");
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setUploadImage(null);
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-indigo-900 to-purple-800 p-6 rounded-2xl shadow-xl w-full border border-white border-opacity-20 backdrop-blur-lg"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Create a New Post</h2>
        {onCancel && (
          <button 
            onClick={onCancel} 
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        )}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title"
        className="w-full p-3 mb-4 bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 mb-4 bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px]"
      />

      {/* Add image button */}
      {!imageUrl && !uploadImage && !showImageOptions && (
        <button
          onClick={() => setShowImageOptions(true)}
          className="flex items-center justify-center space-x-2 w-full p-3 mb-4 bg-white bg-opacity-10 border border-dashed border-gray-200 border-opacity-30 rounded-xl text-gray-300 hover:bg-opacity-20 hover:text-white transition-all"
        >
          <FiImage className="text-lg" />
          <span>Add an image to your post</span>
        </button>
      )}

      {/* Image options */}
      <AnimatePresence>
        {showImageOptions && (
          <motion.div 
            className="mb-4 space-y-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
              <h3 className="text-white text-lg font-medium mb-3">Generate AI Image</h3>
              <div className="flex items-center mb-3 space-x-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="flex-1 p-3 bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleGenerateImage}
                  disabled={loading || !prompt}
                  className="bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400 flex items-center transition-all"
                >
                  {loading ? <FiLoader className="animate-spin" /> : <FiImage />}
                  <span className="ml-2">{loading ? "Generating..." : "Generate"}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
              <h3 className="text-white text-lg font-medium mb-3">Upload Your Own Image</h3>
              <label className="flex flex-col items-center justify-center w-full p-4 bg-white bg-opacity-10 border border-dashed border-gray-200 border-opacity-30 rounded-xl text-gray-300 hover:bg-opacity-20 hover:text-white cursor-pointer transition-all">
                <FiUpload className="text-2xl mb-2" />
                <span className="text-sm">Click to upload image</span>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowImageOptions(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview */}
      {(imageUrl || uploadImage) && (
        <div className="relative mb-4">
          <div className="relative rounded-xl overflow-hidden group">
            <img
              src={imageUrl || (uploadImage ? URL.createObjectURL(uploadImage) : '')}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={clearImage}
                className="bg-red-500 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
              >
                <FiX />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <motion.p 
          className="text-red-300 text-sm mb-4 p-2 bg-red-900 bg-opacity-30 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white p-3 rounded-xl hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] transition-all font-medium"
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin mr-2" /> 
            Publishing...
          </>
        ) : (
          <>
            <FiSend className="mr-2" /> 
            Publish Post
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

// Helper component for animations
const AnimatePresence: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <>{children}</>;
};

export default PostCreator;