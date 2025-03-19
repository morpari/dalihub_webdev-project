import React from "react";
import { Routes, Route } from "react-router-dom"; 
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PostPage from "./pages/PostPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/create-post" element={<PostPage />} />
    </Routes>
  );
}

export default App;

