/**
 * Centralized API Client for Frontend-to-Backend Communication
 * 
 * Provides a consistent interface for calling backend APIs with:
 * - Automatic auth token injection
 * - Standardized error handling
 * - Request/response interceptors
 * - Type safety helpers
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Auth token retrieval (implement based on your auth strategy)
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Option 1: NextAuth
    // const session = await getSession();
    // return session?.accessToken || null;

    // Option 2: Cookies
    // const { cookie } = parseCookies();
    // return cookie.token || null;

    // Option 3: localStorage (not recommended for production)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }

    return null;
  } catch (error) {
    console.error('[API Client] Failed to get auth token', error);
    return null;
  }
};

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor - standardized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('[API Client] API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or refresh token
      console.warn('[API Client] Unauthorized - user needs to re-authenticate');
      // TODO: Implement redirect or token refresh
    }

    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.warn('[API Client] Forbidden - insufficient permissions');
    }

    if (error.response?.status === 404) {
      // Not found
      console.warn('[API Client] Resource not found');
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error('[API Client] Server error occurred');
    }

    return Promise.reject(error);
  }
);

// Helper types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic API call helpers
export const api = {
  /**
   * GET request helper
   */
  get: async <T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * POST request helper
   */
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * PUT request helper
   */
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * PATCH request helper
   */
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * DELETE request helper
   */
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

/**
 * Handle API errors consistently
 */
function handleApiError(error: unknown): ApiResponse<never> {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    return {
      success: false,
      error: axiosError.response?.data?.error?.message || axiosError.message,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

export default api;
