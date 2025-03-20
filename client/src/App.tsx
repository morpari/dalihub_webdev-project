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
        <Route path="/auth/google/callback" element={<GoogleAuthHandler />} /> {/* new */}
      </Routes>
    </>
  );
};

const GoogleAuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("token");  
    const refreshToken = params.get("refreshToken");

    console.log("GoogleAuthHandler triggered - accessToken:", accessToken);
    
    if (accessToken && refreshToken) {
      localStorage.setItem("token", accessToken); 
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/posts"); // Redirect user to Feed Page
    } else {
      console.error("Missing token(s), redirecting to login.");
      navigate("/login?error=unauthorized"); // Redirect to login if missing token
    }
  }, [navigate]);

  return null;
};



export default App;
