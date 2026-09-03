import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure backend runs on 5000 or update accordingly
  withCredentials: true, // For sending cookies
});

// Intercept 401 Unauthorized responses to handle expired/deleted tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if the server rejects the cookie
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
