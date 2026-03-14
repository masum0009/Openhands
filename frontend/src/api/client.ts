import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Agents API
export const agentsApi = {
  list: (skip = 0, limit = 100) =>
    api.get('/agents/', { params: { skip, limit } }),
  get: (id: number) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents/', data),
  update: (id: number, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: number) => api.delete(`/agents/${id}`),
};

// Calls API
export const callsApi = {
  list: (agentId?: number, skip = 0, limit = 100) =>
    api.get('/calls/', { params: { agent_id: agentId, skip, limit } }),
  get: (id: number) => api.get(`/calls/${id}`),
  update: (id: number, data: any) => api.put(`/calls/${id}`, data),
  getTranscript: (id: number) => api.get(`/calls/${id}/transcript`),
};

export default api;
