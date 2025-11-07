import axios from "axios";

// ✅ Axios instance for backend requests
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api" || "http://localhost:5000/api",
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

