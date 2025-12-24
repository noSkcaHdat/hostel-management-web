import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Leave API
export const leaveAPI = {
  apply: (data) => api.post('/leave/apply', data),
  getMyLeaves: () => api.get('/leave/my'),
  getPendingLeaves: () => api.get('/leave/pending'),
  approve: (id) => api.post(`/leave/${id}/approve`),
  reject: (id) => api.post(`/leave/${id}/reject`),
  getGatePass: (id) => api.get(`/leave/${id}/gatepass`),
};

// Gate Pass API
export const gatePassAPI = {
  verify: (code) => api.get(`/gatepass/verify?code=${code}`),
  use: (code) => api.post('/gatepass/use', { code }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

