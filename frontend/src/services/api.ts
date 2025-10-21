import axios from 'axios';
import { AuthResponse, ApiResponse, TasksResponse, TaskStats, Task, User } from '../types';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch logout action to clear Redux state
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<TasksResponse>> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTask: async (id: string): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTaskStats: async (): Promise<ApiResponse<{ stats: TaskStats }>> => {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },
};

export default api;
