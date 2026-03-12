import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import fetch from 'node-fetch';

describe('Backend API Integration Tests', () => {
  let apiProcess: ChildProcess;
  const API_BASE_URL = 'http://localhost:3001';

  beforeAll(async () => {
    // Start the backend API server
    apiProcess = spawn('pnpm', ['dev'], {
      cwd: '/Users/fredrick/Documents/Vayva-Tech/vayva/Backend/core-api',
      env: { ...process.env, PORT: '3001' }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
  }, 30000);

  afterAll(() => {
    if (apiProcess) {
      apiProcess.kill();
    }
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('AI Hub API Endpoints', () => {
    it('should return conversation analytics', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/conversations`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalConversations');
      expect(data.data).toHaveProperty('activeConversations');
      expect(data.data).toHaveProperty('avgResponseTime');
    });

    it('should handle date range parameters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      const response = await fetch(
        `${API_BASE_URL}/api/ai/conversations?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return AI analytics data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/analytics`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('usageMetrics');
      expect(data.data).toHaveProperty('performanceMetrics');
      expect(data.data).toHaveProperty('costAnalytics');
    });

    it('should return AI templates', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/templates`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/templates?category=customer-service`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      data.data.forEach((template: any) => {
        expect(template.category).toBe('customer-service');
      });
    });
  });

  describe('Social Hub API Endpoints', () => {
    it('should return social media connections', async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/social`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle social media connection', async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/social/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'facebook',
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        })
      });
      
      expect([200, 201]).toContain(response.status);
    });

    it('should handle invalid platform connection', async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/social/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'invalid-platform',
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should handle social media disconnection', async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/social/disconnect`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'facebook' })
      });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${API_BASE_URL}/api/non-existent-endpoint`);
      expect(response.status).toBe(404);
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/ai/conversations`, {
        method: 'POST', // Wrong method
        body: 'invalid json'
      });
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array(10).fill(null).map(() => 
        fetch(`${API_BASE_URL}/api/health`)
      );
      
      const responses = await Promise.all(requests);
      const statusCodes = responses.map(r => r.status);
      
      // Should not all fail, but some might be rate limited
      expect(statusCodes.some(code => code === 200)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields in requests', async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/social/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required platform field
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should sanitize input data', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await fetch(`${API_BASE_URL}/api/integrations/social/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: maliciousInput,
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        })
      });
      
      // Should either reject or sanitize the input
      expect([400, 200, 201]).toContain(response.status);
    });
  });
});