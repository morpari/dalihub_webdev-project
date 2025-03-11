import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const WelcomePage = () => {
  return (
    <motion.div
      className="h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
      animate={{
        background: [
          "linear-gradient(to right, #6a11cb, #2575fc)", // Purple to Blue
          "linear-gradient(to right, #ff00cc, #333399)", // Pink to Dark Blue
          "linear-gradient(to right, #1d2671, #c33764)", // Deep Blue to Red
          "linear-gradient(to right, #6a11cb, #2575fc)", // Back to Purple to Blue
        ],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} // Smooth Infinite Animation
    >
      {/* Animated Title */}
      <motion.h1
        className="text-8xl font-extrabold text-gray-300 drop-shadow-lg tracking-wide"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        DaliHub
      </motion.h1>

      {/* Buttons */}
      <motion.div
        className="flex space-x-4 mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link to="/login">
          <button className="w-24 px-3 py-1.5 bg-purple-600 bg-opacity-70 text-gray-300 font-semibold rounded-full shadow-md transition-all hover:scale-105">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="w-24 px-3 py-1.5 bg-purple-600 bg-opacity-70 text-gray-300 font-semibold rounded-full shadow-md transition-all hover:scale-105">
            Sign Up
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default WelcomePage;
