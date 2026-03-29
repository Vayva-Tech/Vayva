/**
 * API Client for Ops-Console to Backend Communication
 * 
 * This client handles all HTTP requests from ops-console to the Fastify backend API.
 * It manages authentication tokens, error handling, and request/response transformation.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get authentication token from cookies or session storage
 */
function getAuthToken(): string | null {
  // Try to get from cookies first
  const cookieName = 'ops-auth-token';
  const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
  if (match && match[2]) {
    return match[2];
  }
  
  // Fallback to sessionStorage
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('opsAuthToken');
  }
  
  return null;
}

/**
 * Store authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('opsAuthToken', token);
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('opsAuthToken');
    document.cookie = 'ops-auth-token=; Max-Age=-99999999; path=/';
  }
}

/**
 * Generic request handler with auth and error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Add authentication header if not skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Request failed' };
      }

      // Handle auth errors
      if (response.status === 401) {
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }

      // Handle permission errors
      if (response.status === 403) {
        throw new Error(errorData.error || 'Permission denied');
      }

      // Handle not found
      if (response.status === 404) {
        throw new Error(errorData.error || 'Resource not found');
      }

      // Handle validation errors
      if (response.status === 400) {
        throw new Error(errorData.error || 'Validation failed');
      }

      // Handle server errors
      if (response.status >= 500) {
        throw new Error(errorData.error || 'Server error');
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Parse response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw if already an Error instance
    if (error instanceof Error) {
      throw error;
    }
    // Wrap unknown errors
    throw new Error(`Request failed: ${String(error)}`);
  }
}

/**
 * API Client methods for different HTTP operations
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>, options?: RequestInit) {
    const queryString = params 
      ? `?${new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        )}`
      : '';
    return request<T>(`${endpoint}${queryString}`, { 
      method: 'GET',
      ...options 
    });
  },

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  },

  /**
   * POST with file upload (uses FormData, no JSON stringify)
   */
  postFile<T>(endpoint: string, formData: FormData, options?: RequestInit) {
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      ...options,
    };
    // Remove Content-Type header to let browser set it with boundary
    delete (config.headers as any)?.['Content-Type'];
    return request<T>(endpoint, config);
  },
};

/**
 * Health check endpoint
 */
export async function checkApiHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    return await request(`${API_BASE_URL}/health`);
  } catch {
    return { status: 'unreachable', timestamp: new Date().toISOString() };
  }
}

export default apiClient;
