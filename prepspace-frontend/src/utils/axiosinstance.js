import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Attach the JWT (stored in localStorage under "prepspace_token") to every request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("prepspace_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralize 401 handling: clear the session and bounce to /login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("prepspace_token");
        localStorage.removeItem("prepspace_user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    } else if (error.code === "ECONNABORTED") {
      error.message = "The request timed out. Please try again.";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
