/**
 * API Client Module
 * 
 * Centralized HTTP client with interceptors, error handling, and request tracking
 */

export {
  ApiClient,
  ApiError,
  type ApiClientConfig,
  type RequestConfig,
  type RequestMethod,
  type ApiResponse,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
} from './base';

export {
  classifyError,
  getUserMessage,
  logError,
  handleApiError,
  ApiErrors,
  type ErrorClassification,
  type ErrorCategory,
} from './error-handler';

export {
  generateRequestId,
  generateRequestMetadata,
  createRequestIdHeaders,
  extractRequestId,
  logRequest,
  logResponse,
} from './request-id';
