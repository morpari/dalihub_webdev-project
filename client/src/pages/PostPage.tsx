import { useState } from "react";
import axios from "axios";

const PostPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateImage = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/posts/generate-image",
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setImageUrl(response.data.imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/posts",
        { title, content, imageUrl,  imagePrompt: imageUrl ? prompt : undefined }, // Attach generated image URL
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Post created successfully!");
      setTitle("");
      setContent("");
      setImageUrl("");
      setPrompt("");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error creating post. Try again.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Create a New Post</h1>

      <input
        type="text"
        placeholder="Post Title"
        className="w-full p-2 border rounded mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write something..."
        className="w-full p-2 border rounded mb-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <h3 className="text-lg font-semibold">Generate AI Image (Optional)</h3>
      <input
        type="text"
        placeholder="Enter a prompt..."
        className="w-full p-2 border rounded mb-2"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerateImage}
        disabled={loading || !prompt}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Generated Image:</h3>
          <img src={imageUrl} alt="Generated" className="mt-2 rounded shadow-md" />
        </div>
      )}

      <button
        onClick={handleSubmitPost}
        className="w-full bg-green-500 text-white p-2 rounded mt-4"
      >
        Submit Post
      </button>
    </div>
  );
};

export default PostPage;
