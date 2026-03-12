/**
 * API Load Test Scenarios
 * Comprehensive load testing for API endpoints
 */

import { ScenarioDefinition } from '../index';

/**
 * Health check endpoint load test
 * Tests the basic availability of the API
 */
export const healthCheckScenario: ScenarioDefinition = {
  name: 'api-health-check',
  description: 'Load test for health check endpoint',
  execute: async (context) => {
    const start = performance.now();
    try {
      const response = await context.request('/api/health');
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Authentication endpoint load test
 * Tests login and token generation under load
 */
export const authLoginScenario: ScenarioDefinition = {
  name: 'api-auth-login',
  description: 'Load test for authentication endpoints',
  setup: async () => {
    // Ensure we're not running against production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Load tests cannot run against production');
    }
  },
  execute: async (context) => {
    const start = performance.now();
    try {
      const response = await context.request('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `loadtest-${context.workerId}@test.com`,
          password: 'testpassword123',
        }),
      });
      const duration = performance.now() - start;
      
      return {
        success: response.ok || response.status === 401, // 401 is expected for invalid creds
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Storefront browse scenario
 * Simulates browsing a storefront
 */
export const storefrontBrowseScenario: ScenarioDefinition = {
  name: 'api-storefront-browse',
  description: 'Load test for storefront browsing endpoints',
  execute: async (context) => {
    const pages = [
      '/api/storefront/products',
      '/api/storefront/categories',
      '/api/storefront/featured',
    ];
    
    const page = pages[Math.floor(Math.random() * pages.length)];
    const start = performance.now();
    
    try {
      const response = await context.request(page);
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Product search scenario
 * Tests product search endpoint under load
 */
export const productSearchScenario: ScenarioDefinition = {
  name: 'api-product-search',
  description: 'Load test for product search endpoint',
  execute: async (context) => {
    const searchTerms = ['shirt', 'shoes', 'electronics', 'home', 'sports', 'books'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const start = performance.now();
    try {
      const response = await context.request(`/api/products/search?q=${encodeURIComponent(term)}`);
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
        metadata: { searchTerm: term },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Dashboard analytics scenario
 * Tests dashboard data endpoints (requires auth)
 */
export const dashboardAnalyticsScenario: ScenarioDefinition = {
  name: 'api-dashboard-analytics',
  description: 'Load test for dashboard analytics endpoints',
  execute: async (context) => {
    const endpoints = [
      '/api/analytics/dashboard',
      '/api/analytics/sales',
      '/api/analytics/orders',
      '/api/account/overview',
    ];
    
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const start = performance.now();
    
    try {
      const response = await context.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN || 'mock-token'}`,
        },
      });
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * API stress test scenario
 * High-intensity test for all API endpoints
 */
export const apiStressScenario: ScenarioDefinition = {
  name: 'api-stress-test',
  description: 'Comprehensive stress test for all API endpoints',
  execute: async (context) => {
    const scenarios = [
      { weight: 40, fn: async () => context.request('/api/health') },
      { weight: 30, fn: async () => context.request('/api/storefront/products') },
      { weight: 20, fn: async () => context.request('/api/products/search?q=test') },
      { weight: 10, fn: async () => context.request('/api/storefront/categories') },
    ];
    
    // Weighted random selection
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = scenarios[0];
    
    for (const scenario of scenarios) {
      random -= scenario.weight;
      if (random <= 0) {
        selected = scenario;
        break;
      }
    }
    
    const start = performance.now();
    try {
      const response = await selected.fn();
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * WebSocket connection scenario
 * Tests WebSocket connection limits
 */
export const websocketLoadScenario: ScenarioDefinition = {
  name: 'api-websocket-connections',
  description: 'Load test for WebSocket connection limits',
  execute: async (context) => {
    const start = performance.now();
    try {
      // Test WebSocket endpoint availability
      const wsUrl = context.baseUrl.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/api/ws`);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket connection timeout'));
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve();
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });
      
      const duration = performance.now() - start;
      return {
        success: true,
        statusCode: 101, // WebSocket switching protocol
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

// Default export for registry loading
export default {
  healthCheckScenario,
  authLoginScenario,
  storefrontBrowseScenario,
  productSearchScenario,
  dashboardAnalyticsScenario,
  apiStressScenario,
  websocketLoadScenario,
};
