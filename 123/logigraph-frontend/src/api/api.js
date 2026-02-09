import axios from "axios";

// Backend runs on port 8081 (see Java/src/main/resources/application.properties)
const api = axios.create({
  baseURL: "http://localhost:8082",
});

// Attach JWT from localStorage to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: global 401 handler -> redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      // simple client-side redirect; adapt to router if needed
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;