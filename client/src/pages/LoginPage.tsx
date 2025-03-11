import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc"; // Google Logo from react-icons

const LoginPage = () => {
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
      {/* Glassmorphic Login Form */}
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-gray-300 text-center">Login</h2>

        {/* Email Input */}
        <div className="mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Password Input */}
        <div className="mt-4">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 bg-transparent border border-white border-opacity-30 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Login Button */}
        <div className="mt-6">
        <button className="w-full px-4 py-2 bg-white bg-opacity-20 text-gray-200 font-semibold rounded-full shadow-md transition-all hover:scale-105">
            Login
        </button>
        </div>

        {/* Google Login Button */}
        <div className="mt-4">
          <button className="w-full flex items-center justify-center px-4 py-2 bg-white bg-opacity-20 text-gray-200 font-semibold rounded-full shadow-md transition-all hover:scale-105">
            <FcGoogle className="mr-2 text-xl" /> Login with Google
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
