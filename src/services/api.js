import axios from "axios";

const api = axios.create({
  baseURL: "https://slapi-production-112f.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // JANGAN tempelkan token jika request mengarah ke endpoint publik /auth/
  const isAuthRequest = config.url.includes("/auth/");

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;