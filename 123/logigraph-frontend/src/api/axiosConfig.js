import axios from 'axios';

const JAVA_API_BASE = 'http://localhost:8082/api';
const DOTNET_API_BASE = 'http://localhost:5160/api';

// Create axios instances
export const javaClient = axios.create({
  baseURL: JAVA_API_BASE,
});

export const dotnetClient = axios.create({
  baseURL: DOTNET_API_BASE,
});

// Request interceptor to add auth token
const addTokenInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

addTokenInterceptor(javaClient);
addTokenInterceptor(dotnetClient);

export default javaClient;
