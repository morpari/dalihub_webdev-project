import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Save token to local storage
      localStorage.setItem("accessToken", token);

      // Redirect user to home or dashboard
      navigate("/posts"); // Change this to your preferred route
    } else {
      navigate("/login?error=unauthorized");
    }
  }, [navigate]);

  return <h1>Logging in...</h1>;
};

export default GoogleCallback;
