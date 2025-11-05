import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      !error.config.url.includes('/auth/register')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // No token on first registration - OTP verification required
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/auth/deleteaccount', { data: { password } });
    localStorage.removeItem('token');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (resetToken, password) => {
    const response = await api.put(`/auth/resetpassword/${resetToken}`, { password });
    return response.data;
  }
};

// Papers API calls
export const papersAPI = {
  getAllPapers: async () => {
    const response = await api.get('/papers');
    return response.data;
  },

  getPaper: async (id) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  createPaper: async (paperData) => {
    const response = await api.post('/papers', paperData);
    return response.data;
  },

  updatePaper: async (id, paperData) => {
    const response = await api.put(`/papers/${id}`, paperData);
    return response.data;
  },

  deletePaper: async (id) => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  }
};

// LaTeX API calls
export const latexAPI = {
  // Download IEEE format PDF compiled from LaTeX
  downloadIEEE: async (paperId) => {
    const response = await api.get(`/latex/ieee/pdf/${paperId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Preview IEEE format (get LaTeX content as text)
  previewIEEE: async (paperId) => {
    const response = await api.get(`/latex/preview/ieee/${paperId}`);
    return response.data;
  }


};

export default api;
