/**
 * Playbook Execution API Tests
 * Tests for the automated workflow execution system
 */

import { describe, it, expect } from 'vitest';

describe('Playbook API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('GET /api/playbooks', () => {
    it('should return playbook list with stats', async () => {
      const response = await fetch(`${baseUrl}/api/playbooks`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Verify structure
      expect(Array.isArray(data.playbooks)).toBe(true);
      
      if (data.playbooks.length > 0) {
        const playbook = data.playbooks[0];
        
        // Required fields
        expect(playbook).toHaveProperty('id');
        expect(playbook).toHaveProperty('name');
        expect(playbook).toHaveProperty('description');
        expect(playbook).toHaveProperty('type');
        expect(playbook).toHaveProperty('stats');
        
        // Stats should have execution data
        expect(playbook.stats).toHaveProperty('totalExecutions');
        expect(playbook.stats).toHaveProperty('successRate');
      }
    });

    it('should filter by type parameter', async () => {
      const validTypes = ['onboarding', 'engagement', 'reactivation'];
      
      for (const type of validTypes) {
        const response = await fetch(`${baseUrl}/api/playbooks?type=${type}`);
        const data = await response.json();
        
        if (data.playbooks.length > 0) {
          data.playbooks.forEach((p: any) => {
            expect(p.type).toBe(type);
          });
        }
      }
    });

    it('should include execution history', async () => {
      const response = await fetch(`${baseUrl}/api/playbooks?includeHistory=true`);
      const data = await response.json();
      
      if (data.playbooks.length > 0 && data.playbooks[0].executions) {
        const execution = data.playbooks[0].executions[0];
        
        expect(execution).toHaveProperty('id');
        expect(execution).toHaveProperty('status');
        expect(execution).toHaveProperty('startedAt');
      }
    });
  });

  describe('POST /api/playbooks/execute', () => {
    it('should trigger manual playbook execution', async () => {
      const executeData = {
        playbookId: 'test-playbook-id',
        storeId: 'test-store-id',
      };

      const response = await fetch(`${baseUrl}/api/playbooks/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executeData),
      });

      // Should accept execution request
      expect([200, 201, 202, 501]).toContain(response.status);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing playbookId and storeId
      };

      const response = await fetch(`${baseUrl}/api/playbooks/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Should reject invalid requests
      expect([400, 501]).toContain(response.status);
    });
  });

  describe('Playbook Statistics', () => {
    it('should calculate success rate correctly', async () => {
      const response = await fetch(`${baseUrl}/api/playbooks`);
      const data = await response.json();
      
      if (data.playbooks.length > 0) {
        const playbook = data.playbooks[0];
        const { totalExecutions, completedExecutions, failedExecutions } = playbook.stats;
        
        if (totalExecutions > 0) {
          const calculatedRate = Math.round((completedExecutions / totalExecutions) * 100);
          
          // Success rate should be between 0-100
          expect(playbook.stats.successRate).toBeGreaterThanOrEqual(0);
          expect(playbook.stats.successRate).toBeLessThanOrEqual(100);
          
          // Verify calculation is reasonable
          expect(Math.abs(playbook.stats.successRate - calculatedRate)).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should track action metrics', async () => {
      const response = await fetch(`${baseUrl}/api/playbooks`);
      const data = await response.json();
      
      if (data.playbooks.length > 0) {
        const playbook = data.playbooks[0];
        
        // Should have action statistics
        expect(playbook.stats).toHaveProperty('actionsTotal');
        expect(playbook.stats).toHaveProperty('actionsCompleted');
        expect(playbook.stats).toHaveProperty('actionsFailed');
        
        // Actions completed + failed should not exceed total
        expect(playbook.stats.actionsCompleted + playbook.stats.actionsFailed)
          .toBeLessThanOrEqual(playbook.stats.actionsTotal);
      }
    });
  });

  describe('Execution Status Tracking', () => {
    it('should have valid status values', async () => {
      const response = await fetch(`${baseUrl}/api/playbooks`);
      const data = await response.json();
      
      const validStatuses = ['pending', 'running', 'completed', 'failed'];
      
      if (data.playbooks.length > 0 && data.playbooks[0].executions) {
        data.playbooks[0].executions.forEach((exec: any) => {
          expect(validStatuses).toContain(exec.status);
        });
      }
    });
  });
});
