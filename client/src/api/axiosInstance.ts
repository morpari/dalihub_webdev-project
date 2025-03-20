import axios from "axios";

const API_URL = process.env.REACT_APP_BACK_URL; 

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) //error handling
);

export default axiosInstance;


/////This ensures all API calls include the JWT token 