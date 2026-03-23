import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. Insufficient permissions.');
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const authEndpoints = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  me: '/auth/me',
  profile: '/auth/profile',
};

export const bookEndpoints = {
  books: '/books',
  book: (id: string) => `/books/${id}`,
  chapters: (id: string) => `/books/${id}/chapters`,
  chapter: (id: string, chapterId: string) => `/books/${id}/chapters/${chapterId}`,
  reorderChapters: (id: string) => `/books/${id}/chapters/reorder`,
  autosave: (id: string) => `/books/${id}/autosave`,
  preview: (id: string) => `/books/${id}/preview`,
};

export const aiEndpoints = {
  wizard: '/ai/wizard',
  draftChapter: '/ai/draft-chapter',
  rewrite: '/ai/rewrite',
  suggestTitles: '/ai/suggest-titles',
};

export const exportEndpoints = {
  pdf: (id: string) => `/export/${id}/pdf`,
  docx: (id: string) => `/export/${id}/docx`,
};
