import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc"; // Google Logo

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      const { accessToken, refreshToken, userId } = response.data;

      // Store both tokens
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("refreshToken", userId);

      navigate("/posts"); // Redirect to feed after signup
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  // Google Signup Handler
  const handleGoogleSignup = () => {
    window.location.href = `${process.env.REACT_APP_BACK_URL}/auth/google`;
  };

  return (
    <motion.div
      className="h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
      animate={{
        background: [
          "linear-gradient(to right, #6a11cb, #2575fc)",
          "linear-gradient(to right, #ff00cc, #333399)",
          "linear-gradient(to right, #1d2671, #c33764)",
          "linear-gradient(to right, #6a11cb, #2575fc)",
        ],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glassmorphic Sign Up Form */}
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white border-opacity-20 w-80"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-gray-300 text-center">Sign Up</h2>

        {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mt-6">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mt-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mt-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mt-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Sign Up Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 bg-opacity-70 text-gray-200 font-semibold rounded-full shadow-md transition-all hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Google Sign Up Button */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center px-4 py-2 bg-white bg-opacity-20 text-gray-200 font-semibold rounded-full shadow-md transition-all hover:scale-105"
          >
            <FcGoogle className="mr-2 text-xl" /> Sign Up with Google
          </button>
        </div>

        {/* Login Link */}
        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignUpPage;
