/**
 * Test Setup File
 * Global test configuration and utilities
 */

import { beforeAll, afterAll } from 'vitest';

// Increase timeout for database operations
beforeAll(() => {
  console.log('🧪 Starting API test suite...');
}, 30000);

afterAll(() => {
  console.log('✅ API test suite completed');
});

// Global test utilities
export const testUtils = {
  /**
   * Wait for a specified number of milliseconds
   */
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Create a mock store for testing
   */
  createMockStore: () => ({
    id: `test-store-${Date.now()}`,
    name: 'Test Store',
    ownerId: `test-owner-${Date.now()}`,
  }),
  
  /**
   * Validate ISO date string
   */
  isValidISODate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },
  
  /**
   * Generate random ID for testing
   */
  randomId: () => `test-${Math.random().toString(36).substr(2, 9)}`,
};

// Export for use in tests
export { testUtils };
