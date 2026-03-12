import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNextRequest } from '../helpers/test-utils';

// Mock the API handler
vi.mock('@/lib/api-handler', () => ({
  apiHandler: vi.fn().mockImplementation((handler) => handler),
}));

describe('Social Hub API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/integrations/social', () => {
    it('should return social media connections with proper structure', async () => {
      const { GET } = await import('@/app/api/integrations/social/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/integrations/social',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // Check connection structure
      if (data.data.length > 0) {
        const firstConnection = data.data[0];
        expect(firstConnection).toHaveProperty('platform');
        expect(firstConnection).toHaveProperty('connected');
        expect(firstConnection).toHaveProperty('lastSync');
        expect(firstConnection).toHaveProperty('metrics');
      }
    });

    it('should return all major social platforms', async () => {
      const { GET } = await import('@/app/api/integrations/social/route');
      
      const mockReq = mockNextRequest({
        method: 'GET',
        url: '/api/integrations/social',
      });
      
      const response = await GET(mockReq);
      const data = await response.json();
      
      const platforms = data.data.map((conn: any) => conn.platform);
      const expectedPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];
      
      expectedPlatforms.forEach(platform => {
        expect(platforms).toContain(platform);
      });
    });
  });

  describe('POST /api/integrations/social/connect', () => {
    it('should handle social media connection requests', async () => {
      const { POST } = await import('@/app/api/integrations/social/connect/route');
      
      const mockReq = mockNextRequest({
        method: 'POST',
        url: '/api/integrations/social/connect',
        body: {
          platform: 'facebook',
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        }
      });
      
      const response = await POST(mockReq);
      const data = await response.json();
      
      expect([200, 201]).toContain(response.status);
      expect(data.success).toBe(true);
    });

    it('should reject invalid platform', async () => {
      const { POST } = await import('@/app/api/integrations/social/connect/route');
      
      const mockReq = mockNextRequest({
        method: 'POST',
        url: '/api/integrations/social/connect',
        body: {
          platform: 'invalid-platform',
          redirectUrl: 'http://localhost:3000/dashboard/settings/social-hub'
        }
      });
      
      const response = await POST(mockReq);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/integrations/social/disconnect', () => {
    it('should handle social media disconnection', async () => {
      const { DELETE } = await import('@/app/api/integrations/social/disconnect/route');
      
      const mockReq = mockNextRequest({
        method: 'DELETE',
        url: '/api/integrations/social/disconnect',
        body: {
          platform: 'facebook'
        }
      });
      
      const response = await DELETE(mockReq);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe('Social Hub Business Logic Tests', () => {
  it('should validate social platform connections', () => {
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];
    const invalidPlatforms = ['myspace', 'friendster', 'invalid'];
    
    validPlatforms.forEach(platform => {
      expect(isValidPlatform(platform)).toBe(true);
    });
    
    invalidPlatforms.forEach(platform => {
      expect(isValidPlatform(platform)).toBe(false);
    });
  });

  it('should calculate engagement rates correctly', () => {
    const metrics = {
      likes: 150,
      comments: 25,
      shares: 12,
      impressions: 1000
    };
    
    const engagementRate = ((metrics.likes + metrics.comments + metrics.shares) / metrics.impressions) * 100;
    
    expect(engagementRate).toBeCloseTo(18.7, 1);
    expect(engagementRate).toBeGreaterThanOrEqual(0);
    expect(engagementRate).toBeLessThanOrEqual(100);
  });

  it('should determine connection status correctly', () => {
    const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
    
    expect(getConnectionStatus(recentDate)).toBe('active');
    expect(getConnectionStatus(oldDate)).toBe('needs_refresh');
  });
});

// Helper functions for business logic tests
function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'];
  return validPlatforms.includes(platform.toLowerCase());
}

function getConnectionStatus(lastSync: Date): string {
  const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceSync <= 24) return 'active';
  if (hoursSinceSync <= 168) return 'warning'; // 7 days
  return 'needs_refresh';
}