import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('ceylonstay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 means the session itself is invalid (no/expired token) — log out and
    // send them to /login. 403 means the token is fine but this request isn't
    // allowed (e.g. a room-endpoint call for a hotel this account doesn't own)
    // — that's not a session problem, so don't clear the session or redirect;
    // let the calling page catch it and show an inline "not authorized" message.
    //
    // The login request itself is exempt: a wrong-credentials 401 there isn't
    // an expired session, it's a failed login attempt, and the login page
    // needs the rejected promise intact to show an inline error instead of
    // being redirected to itself mid-submit.
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('ceylonstay_token');
      localStorage.removeItem('ceylonstay_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
