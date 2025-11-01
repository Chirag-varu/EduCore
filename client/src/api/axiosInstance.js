import axios from "axios";

// Always target the same-origin /api proxy path; Vite proxies to the server in development
const axiosInstance = axios.create({
  baseURL: "/api/v1",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token") || "";

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;
