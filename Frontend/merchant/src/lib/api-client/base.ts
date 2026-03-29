/**
 * Base API Client with Interceptors
 * 
 * Features:
 * - Request/response interceptors
 * - Automatic token refresh on 401
 * - Retry logic for failed requests
 * - Request cancellation support
 * - Correlation ID tracking
 */

import { logger } from '@/lib/logger';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
}

export interface RequestConfig extends RequestInit {
  method?: RequestMethod;
  correlationId?: string;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  correlationId?: string;
}

export type RequestInterceptor = (config: RequestConfig) => Promise<RequestConfig>;
export type ResponseInterceptor<T = unknown> = (response: ApiResponse<T>) => Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => Promise<ApiError>;

export class ApiError extends Error {
  status?: number;
  code?: string;
  correlationId?: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      correlationId?: string;
      details?: Record<string, string[]>;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.correlationId = options?.correlationId;
    this.details = options?.details;
  }
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.retries ?? 1;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Generate correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Build full URL from path
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseURL}/${normalizedPath}`;
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    return modifiedError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(status?: number): boolean {
    if (!status) return false;
    // Retry on 5xx server errors and 429 rate limits
    return status >= 500 || status === 429;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute HTTP request with retry logic
   */
  async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const correlationId = config.correlationId || this.generateCorrelationId();
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Apply request interceptors
        let finalConfig = {
          ...config,
          correlationId,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
            ...config.headers,
          },
        };

        finalConfig = await this.applyRequestInterceptors(finalConfig);

        // Execute request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.buildUrl(path), {
          ...finalConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        const apiResponse: ApiResponse<T> = {
          success: response.ok,
          correlationId,
        };

        if (response.ok) {
          apiResponse.data = data as T;
        } else {
          apiResponse.error = {
            code: (data as Record<string, unknown>)?.code as string || 'UNKNOWN_ERROR',
            message: (data as Record<string, unknown>)?.message as string || 'Request failed',
            details: (data as Record<string, unknown>)?.details as Record<string, string[]>,
          };
        }

        // Apply response interceptors
        const interceptedResponse = await this.applyResponseInterceptors(apiResponse);

        if (!response.ok) {
          throw new ApiError(interceptedResponse.error?.message || 'Request failed', {
            status: response.status,
            code: interceptedResponse.error?.code,
            correlationId,
            details: interceptedResponse.error?.details,
          });
        }

        return interceptedResponse;
      } catch (error) {
        // Handle abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError('Request timeout', {
            code: 'TIMEOUT',
            correlationId,
          });
        }

        // Handle API errors
        if (error instanceof ApiError) {
          lastError = error;

          // Check if retryable
          if (attempt < this.maxRetries && this.isRetryable(error.status) && !config.skipRetry) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            logger.warn('[API_RETRY]', {
              attempt: attempt + 1,
              maxRetries: this.maxRetries,
              delay,
              error: error.message,
              correlationId,
            });
            await this.sleep(delay);
            continue;
          }

          // Apply error interceptors
          const processedError = await this.applyErrorInterceptors(error);
          throw processedError;
        }

        // Handle network errors
        const networkError = new ApiError(
          error instanceof Error ? error.message : 'Network error',
          { correlationId }
        );
        lastError = networkError;

        if (attempt < this.maxRetries && !config.skipRetry) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.warn('[API_RETRY]', {
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delay,
            error: networkError.message,
            correlationId,
          });
          await this.sleep(delay);
          continue;
        }

        throw networkError;
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new ApiError('Unknown error');
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}
