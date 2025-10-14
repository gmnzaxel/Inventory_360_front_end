import axios from 'axios';
import { parseApiError } from '../utils/errors';

const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401 and retry once
let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const resp = await axios.post(`${BASE_URL}/user-control/token/refresh/`, { refresh: refreshToken });
        const newAccess = resp.data.access;
        localStorage.setItem('accessToken', newAccess);
        processQueue(null, newAccess);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Cleanup tokens on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    if (!error.inventoryError) {
      error.inventoryError = parseApiError(error);
    }
    return Promise.reject(error);
  }
);

export default api;


