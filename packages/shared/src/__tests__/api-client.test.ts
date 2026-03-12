import { ApiClient, createApiClient, handleApiError } from '../utils/api-client';

describe('api-client utilities', () => {
  describe('ApiClient', () => {
    let apiClient: ApiClient;
    
    beforeEach(() => {
      apiClient = new ApiClient('https://api.example.com');
    });

    describe('constructor', () => {
      it('should create client with base URL', () => {
        expect(apiClient).toBeDefined();
      });
    });

    describe('request methods', () => {
      // Note: These tests would require mocking fetch
      // For now, we'll test the structure and error handling
      
      it('should handle timeout errors', async () => {
        // Mock a slow fetch that exceeds timeout
        global.fetch = jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 100)
          )
        );

        await expect(apiClient.get('/test', { timeout: 50 }))
          .rejects.toThrow('Request timeout');
      });
    });
  });

  describe('createApiClient', () => {
    it('should create client with auth header', () => {
      const client = createApiClient('https://api.example.com', 'test-token');
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should create client without auth', () => {
      const client = createApiClient('https://api.example.com');
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('handleApiError', () => {
    it('should handle timeout error', () => {
      const error = new Error('Request timeout');
      error.name = 'AbortError';
      
      const result = handleApiError(error);
      expect(result.message).toBe('Request timed out. Please try again.');
      expect(result.code).toBe('TIMEOUT');
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      expect(result.message).toBe('Something went wrong');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle non-error objects', () => {
      const result = handleApiError('unknown error');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('UNEXPECTED_ERROR');
    });
  });
});