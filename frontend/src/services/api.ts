import axios from 'axios';

const baseURL = import.meta.env.PROD 
  ? '/api/' 
  : 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes('/login/')) {
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('is_admin');

        window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;