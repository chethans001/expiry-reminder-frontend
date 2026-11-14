import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to add JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expiry_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth pages
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && !path.includes('/forgot-password') && path !== '/') {
        localStorage.removeItem('expiry_token');
        localStorage.removeItem('expiry_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
