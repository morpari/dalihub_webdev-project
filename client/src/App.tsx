import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FeedPage from "./pages/FeedPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/posts" element={<FeedPage />} />
        <Route path="/auth/google/callback" element={<GoogleAuthHandler />} /> {/* ✅ Added this */}
      </Routes>
    </>
  );
};

const GoogleAuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");  // ✅ Use correct parameter name

    console.log("GoogleAuthHandler triggered - token:", token);
    
    if (token) {
      localStorage.setItem("token", token); 
      navigate("/posts"); // Redirect user to Feed Page
    } else {
      console.error("Missing token, redirecting to login.");
      navigate("/login?error=unauthorized"); // Redirect to login if missing token
    }
  }, [navigate]);

  return <h1>Logging in...</h1>;  // ✅ Show a loading message
};

export default App;
