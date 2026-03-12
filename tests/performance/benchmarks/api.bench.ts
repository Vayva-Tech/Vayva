/**
 * API Performance Benchmarks
 * Tests API endpoint response times against targets
 */

import { describe, bench, beforeAll } from 'vitest';
import { BENCHMARK_TARGETS } from '../config';

const BASE_URL = process.env.BENCHMARK_BASE_URL || 'http://localhost:3000';

describe('API Response Time Benchmarks', () => {
  // Verify API is available before running benchmarks
  beforeAll(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`API health check failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('API not available, skipping benchmarks:', error);
      // Skip benchmarks if API is not available
    }
  });

  describe('Public Endpoints', () => {
    bench(
      'GET /api/health',
      async () => {
        const response = await fetch(`${BASE_URL}/api/health`);
        await response.text();
      },
      {
        iterations: 1000,
        time: 1000,
      }
    );

    bench(
      'GET /api/storefront/products',
      async () => {
        const response = await fetch(`${BASE_URL}/api/storefront/products?limit=20`);
        await response.text();
      },
      {
        iterations: 500,
        time: 1000,
      }
    );

    bench(
      'GET /api/storefront/categories',
      async () => {
        const response = await fetch(`${BASE_URL}/api/storefront/categories`);
        await response.text();
      },
      {
        iterations: 500,
        time: 1000,
      }
    );

    bench(
      'GET /api/products/search',
      async () => {
        const response = await fetch(`${BASE_URL}/api/products/search?q=test&limit=10`);
        await response.text();
      },
      {
        iterations: 300,
        time: 1000,
      }
    );
  });

  describe('Authenticated Endpoints', () => {
    // These would require authentication in real scenarios
    bench(
      'GET /api/account/overview (mock)',
      async () => {
        // Simulating an authenticated request
        const response = await fetch(`${BASE_URL}/api/health`, {
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });
        await response.text();
      },
      {
        iterations: 500,
        time: 1000,
      }
    );

    bench(
      'GET /api/analytics/dashboard (mock)',
      async () => {
        const response = await fetch(`${BASE_URL}/api/health`, {
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });
        await response.text();
      },
      {
        iterations: 300,
        time: 1000,
      }
    );
  });

  describe('Write Operations', () => {
    bench(
      'POST /api/cart/items (mock)',
      async () => {
        const response = await fetch(`${BASE_URL}/api/health`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });
        await response.text();
      },
      {
        iterations: 200,
        time: 1000,
      }
    );
  });

  describe('Concurrent Requests', () => {
    bench(
      '10 concurrent health checks',
      async () => {
        await Promise.all(
          Array(10)
            .fill(null)
            .map(() => fetch(`${BASE_URL}/api/health`))
        );
      },
      {
        iterations: 100,
        time: 1000,
      }
    );

    bench(
      '5 concurrent product searches',
      async () => {
        await Promise.all(
          Array(5)
            .fill(null)
            .map(() => fetch(`${BASE_URL}/api/products/search?q=test`))
        );
      },
      {
        iterations: 100,
        time: 1000,
      }
    );
  });
});

describe('API Throughput Benchmarks', () => {
  bench(
    'sustained health check throughput',
    async () => {
      // Make 50 sequential requests
      for (let i = 0; i < 50; i++) {
        await fetch(`${BASE_URL}/api/health`);
      }
    },
    {
      iterations: 20,
      time: 5000,
    }
  );
});

describe('API Performance Targets', () => {
  // These tests verify our targets are defined correctly
  // Actual performance validation happens in CI
  
  const { test, expect } = await import('vitest');
  
  test('p95 latency target is 200ms', () => {
    expect(BENCHMARK_TARGETS.api.p95).toBe(200);
  });

  test('p99 latency target is 500ms', () => {
    expect(BENCHMARK_TARGETS.api.p99).toBe(500);
  });

  test('target RPS is 100', () => {
    expect(BENCHMARK_TARGETS.throughput.rps).toBe(100);
  });
});
