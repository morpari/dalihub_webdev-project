import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Save token to local storage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);


      navigate("/posts"); 
    } else {
      navigate("/login?error=unauthorized");
    }
  }, [navigate]);

  return <h1>Logging in...</h1>;
};

export default GoogleCallback;
