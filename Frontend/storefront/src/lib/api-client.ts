/**
 * Storefront API Client
 * Handles communication with backend Fastify server
 * Supports both authenticated (JWT) and session-based (anonymous) requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get authentication token from cookies or storage
 */
function getAuthToken(): string | null {
  // For SSR/ISR - check cookies
  if (typeof window === 'undefined') {
    const { cookies } = require('next/headers');
    return cookies().get('auth_token')?.value || null;
  }
  
  // For CSR - check localStorage
  return localStorage.getItem('auth_token') || null;
}

/**
 * Get session token for anonymous carts/bookings
 */
function getSessionToken(): string | null {
  if (typeof window === 'undefined') {
    const { cookies } = require('next/headers');
    return cookies().get('cart_session')?.value || null;
  }
  
  return localStorage.getItem('cart_session') || null;
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  useSession?: boolean;
}

/**
 * Generic request handler with retry logic
 */
async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = true,
    useSession = false,
  } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  };

  // Add authentication
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add session token for anonymous operations
  if (useSession) {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      (config.headers as Record<string, string>)['X-Session-Token'] = sessionToken;
    }
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API client with typed methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, string>, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return request<T>(`${endpoint}${queryString}`, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Public endpoint (no auth required)
   */
  publicGet<T>(endpoint: string, params?: Record<string, string>) {
    return this.get<T>(endpoint, params, { requiresAuth: false });
  },

  /**
   * Session-based request (for anonymous carts, etc.)
   */
  sessionGet<T>(endpoint: string, params?: Record<string, string>) {
    return this.get<T>(endpoint, params, { requiresAuth: false, useSession: true });
  },

  sessionPost<T>(endpoint: string, body?: any) {
    return this.post<T>(endpoint, body, { requiresAuth: false, useSession: true });
  },
};

/**
 * Error handling utility
 */
export function handleApiError(error: any): { message: string; code?: string } {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return { message: 'Request timed out. Please try again.', code: 'TIMEOUT' };
    }
    return { message: error.message, code: 'API_ERROR' };
  }
  return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}

export default apiClient;
