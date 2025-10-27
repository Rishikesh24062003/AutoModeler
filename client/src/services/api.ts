import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ModelDefinition,
  ModelSummary,
  DataRecord,
  APIResponse,
} from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and get JWT token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
};

// ============================================
// Model Management API
// ============================================

export const modelAPI = {
  /**
   * Publish a new model definition
   */
  publishModel: async (modelDefinition: Omit<ModelDefinition, 'createdAt'>): Promise<APIResponse<ModelDefinition>> => {
    const response = await apiClient.post<APIResponse<ModelDefinition>>('/models/publish', modelDefinition);
    return response.data;
  },

  /**
   * Get all published models
   */
  getModels: async (): Promise<ModelSummary[]> => {
    const response = await apiClient.get<{ models: ModelSummary[] }>('/models');
    return response.data.models;
  },

  /**
   * Get a specific model definition
   */
  getModel: async (modelName: string): Promise<ModelDefinition> => {
    const response = await apiClient.get<{ model: ModelDefinition }>(`/models/${modelName}`);
    return response.data.model;
  },
};

// ============================================
// Dynamic CRUD API
// ============================================

export const dataAPI = {
  /**
   * Get all records for a model
   */
  getData: async (modelName: string): Promise<DataRecord[]> => {
    const pluralName = `${modelName.toLowerCase()}s`;
    const response = await apiClient.get<{ data: DataRecord[]; count: number }>(`/${pluralName}`);
    return response.data.data;
  },

  /**
   * Get a single record by ID
   */
  getRecord: async (modelName: string, id: number): Promise<DataRecord> => {
    const pluralName = `${modelName.toLowerCase()}s`;
    const response = await apiClient.get<{ data: DataRecord }>(`/${pluralName}/${id}`);
    return response.data.data;
  },

  /**
   * Create a new record
   */
  createRecord: async (modelName: string, data: Partial<DataRecord>): Promise<DataRecord> => {
    const pluralName = `${modelName.toLowerCase()}s`;
    const response = await apiClient.post<{ message: string; data: DataRecord }>(`/${pluralName}`, data);
    return response.data.data;
  },

  /**
   * Update an existing record
   */
  updateRecord: async (modelName: string, id: number, data: Partial<DataRecord>): Promise<DataRecord> => {
    const pluralName = `${modelName.toLowerCase()}s`;
    const response = await apiClient.put<{ message: string; data: DataRecord }>(`/${pluralName}/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a record
   */
  deleteRecord: async (modelName: string, id: number): Promise<void> => {
    const pluralName = `${modelName.toLowerCase()}s`;
    await apiClient.delete(`/${pluralName}/${id}`);
  },
};

// ============================================
// User Management API (Super Admin Only)
// ============================================

export const userAPI = {
  /**
   * Get all users (Super Admin only)
   */
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  /**
   * Update user role (Super Admin only)
   */
  updateUserRole: async (userId: number, role: 'ADMIN' | 'MANAGER' | 'VIEWER') => {
    const response = await apiClient.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Delete user (Super Admin only)
   */
  deleteUser: async (userId: number) => {
    await apiClient.delete(`/users/${userId}`);
  },
};

// ============================================
// Error Handling Utility
// ============================================

export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIResponse>;
    
    // Server responded with an error
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    
    // Network error or no response
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  // Generic error
  return 'An unexpected error occurred';
};

// Export default apiClient for custom requests
export default apiClient;
