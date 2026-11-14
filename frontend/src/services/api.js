import axios from 'axios';

/**
 * Resolves the backend API base URL.
 * Supports:
 * - Local development fallback: '/api' (proxied by Vite)
 * - Remote backend URL: e.g. 'https://my-backend.onrender.com' -> 'https://my-backend.onrender.com/api'
 * - Already suffixed URL: e.g. 'https://my-backend.onrender.com/api' -> 'https://my-backend.onrender.com/api'
 * - Correctly strips trailing slashes and prevents duplicate /api
 */
export function getBaseApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }

  // Remove all trailing slashes
  let cleanUrl = envUrl.trim().replace(/\/+$/, '');

  // If it already ends with /api, keep as is; otherwise append /api
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }

  return cleanUrl;
}

/**
 * Resolves uploaded asset URLs (e.g. product images stored in /uploads).
 * In production on Vercel, requests for /uploads must point to the Render backend origin.
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const baseApi = getBaseApiUrl();
  if (baseApi.startsWith('http://') || baseApi.startsWith('https://')) {
    const origin = baseApi.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${cleanPath}`;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

const api = axios.create({
  baseURL: getBaseApiUrl(),
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to add JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expiry_token');
    // Only set Authorization if not explicitly set on the request (e.g., Supabase token header)
    if (token && !config.headers.Authorization) {
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
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/');
      const isAuthPage =
        path.includes('/login') ||
        path.includes('/register') ||
        path.includes('/forgot-password') ||
        path === '/';

      if (!isAuthRequest && !isAuthPage) {
        localStorage.removeItem('expiry_token');
        localStorage.removeItem('expiry_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
