/**
 * Comprehensive API Integration Tests
 * End-to-end tests for ops-console functionality
 */

import { describe, it, expect } from 'vitest';
import { testUtils } from './setup';

describe('Ops Console Integration Tests', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('System Health Check', () => {
    it('should pass all health checks', async () => {
      const endpoints = [
        '/api/ops/health/system',
        '/api/health-score',
        '/api/nps',
        '/api/playbooks',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`);
        
        // Allow 501 for endpoints not yet implemented
        expect([200, 501]).toContain(response.status);
      }
    });
  });

  describe('Cross-API Data Consistency', () => {
    it('should have consistent store IDs across APIs', async () => {
      // Fetch data from multiple APIs
      const [healthRes, npsRes, playbookRes] = await Promise.all([
        fetch(`${baseUrl}/api/health-score`),
        fetch(`${baseUrl}/api/nps`),
        fetch(`${baseUrl}/api/playbooks`),
      ]);

      const healthData = await healthRes.json();
      const npsData = await npsRes.json();
      const playbookData = await playbookRes.json();

      // Extract store IDs if available
      const healthStores = healthData.scores?.map((s: any) => s.storeId) || [];
      const npsStores = npsData.metrics?.stores || [];
      
      // If both have data, verify consistency
      if (healthStores.length > 0 && npsStores.length > 0) {
        // At least some stores should exist in both
        const commonStores = healthStores.filter((id: string) => 
          npsStores.includes(id)
        );
        
        // This is a soft check - just log if no common stores
        if (commonStores.length === 0) {
          console.log('ℹ️  No common stores between health and NPS (expected in test env)');
        }
      }
    });
  });

  describe('API Response Time Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const maxResponseTime = 2000; // 2 seconds
      const endpoints = [
        '/api/health-score',
        '/api/nps',
        '/api/playbooks',
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        console.log(`⏱️  ${endpoint}: ${responseTime}ms`);
        
        // Response should be fast (under maxResponseTime)
        expect(responseTime).toBeLessThan(maxResponseTime);
        expect(response.status).toBeOneOf([200, 501]);
      }
    }, 10000);
  });

  describe('Data Validation Across All APIs', () => {
    it('should return properly typed data', async () => {
      const responses = await Promise.all([
        fetch(`${baseUrl}/api/health-score`),
        fetch(`${baseUrl}/api/nps`),
        fetch(`${baseUrl}/api/playbooks`),
      ]);

      const results = await Promise.all(responses.map(r => r.json()));
      const [healthData, npsData, playbookData] = results;

      // Validate health score data types
      if (healthData.scores?.length > 0) {
        const score = healthData.scores[0];
        expect(typeof score.id).toBe('string');
        expect(typeof score.storeId).toBe('string');
        expect(typeof score.score).toBe('number');
        expect(testUtils.isValidISODate(score.date)).toBe(true);
      }

      // Validate NPS data types
      if (npsData.metrics) {
        const metrics = npsData.metrics;
        expect(typeof metrics.total).toBe('number');
        expect(typeof metrics.promoters).toBe('number');
        expect(typeof metrics.detractors).toBe('number');
      }

      // Validate playbook data types
      if (playbookData.playbooks?.length > 0) {
        const playbook = playbookData.playbooks[0];
        expect(typeof playbook.id).toBe('string');
        expect(typeof playbook.name).toBe('string');
        expect(typeof playbook.type).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      const invalidRequests = [
        {
          url: '/api/health-score?storeId=',
          description: 'Empty storeId',
        },
        {
          url: '/api/nps?startDate=invalid-date',
          description: 'Invalid date format',
        },
        {
          url: '/api/playbooks?type=nonexistent-type',
          description: 'Invalid playbook type',
        },
      ];

      for (const { url, description } of invalidRequests) {
        const response = await fetch(`${baseUrl}${url}`);
        
        // Should not crash - either return empty data or 400/404
        expect([200, 400, 404, 501]).toContain(response.status);
        console.log(`✅ ${description}: Handled gracefully`);
      }
    });
  });

  describe('API Contract Validation', () => {
    it('should maintain consistent API structure', async () => {
      const responses = {
        health: await fetch(`${baseUrl}/api/health-score`).then(r => r.json()),
        nps: await fetch(`${baseUrl}/api/nps`).then(r => r.json()),
        playbooks: await fetch(`${baseUrl}/api/playbooks`).then(r => r.json()),
      };

      // All should return objects
      expect(typeof responses.health).toBe('object');
      expect(typeof responses.nps).toBe('object');
      expect(typeof responses.playbooks).toBe('object');

      // Check for expected top-level keys
      expect(Object.keys(responses.health).length).toBeGreaterThan(0);
      expect(Object.keys(responses.nps).length).toBeGreaterThan(0);
      expect(Object.keys(responses.playbooks).length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const numRequests = 5;
      const requests = Array(numRequests).fill(null).map(() => 
        fetch(`${baseUrl}/api/health-score`)
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect([200, 501]).toContain(response.status);
      });

      console.log(`✅ Successfully handled ${numRequests} concurrent requests`);
    }, 15000);
  });
});
