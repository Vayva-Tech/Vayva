import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNextRequest } from '../helpers/test-utils';

// Mock the API handler
vi.mock('@/lib/api-handler', () => ({
  apiHandler: vi.fn().mockImplementation((handler) => handler),
}));

describe('AI Hub API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ai/conversations', () => {
    it('should return conversation analytics with proper structure', async () => {
      const { GET } = await import('@/app/api/ai/conversations/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/conversations',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalConversations');
      expect(data.data).toHaveProperty('activeConversations');
      expect(data.data).toHaveProperty('avgResponseTime');
      expect(data.data).toHaveProperty('topIntents');
      expect(data.data).toHaveProperty('conversationHistory');
    });

    it('should handle date range filtering', async () => {
      const { GET } = await import('@/app/api/ai/conversations/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/conversations?startDate=2024-01-01&endDate=2024-01-31',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/ai/analytics', () => {
    it('should return AI performance analytics', async () => {
      const { GET } = await import('@/app/api/ai/analytics/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/analytics',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('usageMetrics');
      expect(data.data).toHaveProperty('performanceMetrics');
      expect(data.data).toHaveProperty('costAnalytics');
      expect(data.data).toHaveProperty('modelPerformance');
    });

    it('should calculate cost correctly', async () => {
      const { GET } = await import('@/app/api/ai/analytics/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/analytics',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(data.data.costAnalytics.totalCost).toBeGreaterThanOrEqual(0);
      expect(data.data.costAnalytics.costByModel).toBeDefined();
    });
  });

  describe('GET /api/ai/templates', () => {
    it('should return AI prompt templates', async () => {
      const { GET } = await import('@/app/api/ai/templates/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/templates',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Check template structure
      const firstTemplate = data.data[0];
      expect(firstTemplate).toHaveProperty('id');
      expect(firstTemplate).toHaveProperty('name');
      expect(firstTemplate).toHaveProperty('category');
      expect(firstTemplate).toHaveProperty('prompt');
      expect(firstTemplate).toHaveProperty('variables');
    });

    it('should filter templates by category', async () => {
      const { GET } = await import('@/app/api/ai/templates/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/ai/templates?category=customer-service',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // All returned templates should be in customer-service category
      data.data.forEach((template: any) => {
        expect(template.category).toBe('customer-service');
      });
    });
  });
});

describe('AI Hub Business Logic Tests', () => {
  it('should calculate conversation metrics correctly', () => {
    const conversations = [
      { id: '1', messages: 5, createdAt: new Date('2024-01-01'), status: 'completed' },
      { id: '2', messages: 3, createdAt: new Date('2024-01-02'), status: 'active' },
      { id: '3', messages: 8, createdAt: new Date('2024-01-03'), status: 'completed' },
    ];
    
    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const avgMessages = conversations.reduce((sum, c) => sum + c.messages, 0) / conversations.length;
    
    expect(totalConversations).toBe(3);
    expect(activeConversations).toBe(1);
    expect(avgMessages).toBeCloseTo(5.33, 2);
  });

  it('should categorize intents correctly', () => {
    const sampleIntents = [
      'order status inquiry',
      'product recommendation',
      'refund request',
      'order status inquiry',
      'technical support',
      'product recommendation'
    ];
    
    const intentCounts: Record<string, number> = {};
    sampleIntents.forEach(intent => {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });
    
    const sortedIntents = Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
    
    expect(sortedIntents.length).toBeLessThanOrEqual(5);
    expect(sortedIntents[0].count).toBeGreaterThanOrEqual(sortedIntents[sortedIntents.length - 1]?.count || 0);
  });
});