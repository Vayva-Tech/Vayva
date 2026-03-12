import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the withVayvaAPI wrapper and dependencies
vi.mock('@/lib/api-handler', () => ({
  withVayvaAPI: vi.fn((permission, handler) => handler)
}));

vi.mock('@/lib/team/permissions', () => ({
  PERMISSIONS: {
    FASHION_LOOKBOOKS_VIEW: 'fashion:lookbooks:view',
    FASHION_LOOKBOOKS_MANAGE: 'fashion:lookbooks:manage'
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('Fashion Lookbooks API', () => {
  const mockStoreId = 'test-store-123';
  const mockUserId = 'test-user-456';
  const mockContext = {
    storeId: mockStoreId,
    user: {
      id: mockUserId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      storeId: mockStoreId,
      storeName: 'Test Store',
      role: 'admin',
      sessionVersion: 1
    },
    db: {
      lookbook: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      product: {
        findMany: vi.fn()
      }
    },
    params: {}
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('GET /api/fashion/lookbooks', () => {
    it('should return lookbooks with pagination', async () => {
      const mockLookbooks = [
        {
          id: 'lb-1',
          title: 'Summer Collection',
          description: 'Beautiful summer looks',
          isActive: true,
          coverImage: 'https://example.com/image1.jpg',
          createdAt: new Date().toISOString()
        },
        {
          id: 'lb-2',
          title: 'Winter Collection',
          description: 'Cozy winter styles',
          isActive: true,
          coverImage: 'https://example.com/image2.jpg',
          createdAt: new Date().toISOString()
        }
      ];

      mockContext.db.lookbook.findMany.mockResolvedValue(mockLookbooks);
      mockContext.db.lookbook.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks?page=1&limit=20');
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockLookbooks);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(20);
      expect(data.meta.total).toBe(2);
    });

    it('should handle search queries', async () => {
      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks?search=summer');
      
      mockContext.db.lookbook.findMany.mockResolvedValue([]);
      mockContext.db.lookbook.count.mockResolvedValue(0);

      await GET(request, mockContext);

      expect(mockContext.db.lookbook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'summer', mode: 'insensitive' } },
              { description: { contains: 'summer', mode: 'insensitive' } }
            ]
          })
        })
      );
    });

    it('should handle active status filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks?isActive=true');
      
      mockContext.db.lookbook.findMany.mockResolvedValue([]);
      mockContext.db.lookbook.count.mockResolvedValue(0);

      await GET(request, mockContext);

      expect(mockContext.db.lookbook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true
          })
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks');
      
      mockContext.db.lookbook.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOKS_FETCH_FAILED');
    });
  });

  describe('POST /api/fashion/lookbooks', () => {
    it('should create a new lookbook successfully', async () => {
      const requestBody = {
        title: 'New Collection',
        description: 'A beautiful new collection',
        coverImage: 'https://example.com/new-image.jpg',
        isActive: true,
        productIds: ['prod-1', 'prod-2']
      };

      const mockCreatedLookbook = {
        id: 'lb-new',
        ...requestBody,
        storeId: mockStoreId,
        createdBy: mockUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockContext.db.product.findMany.mockResolvedValue([
        { id: 'prod-1' },
        { id: 'prod-2' }
      ]);

      mockContext.db.lookbook.create.mockResolvedValue(mockCreatedLookbook);

      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Collection');
      expect(mockContext.db.lookbook.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const requestBody = {
        description: 'Missing title field'
      };

      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid product IDs', async () => {
      const requestBody = {
        title: 'Collection with Invalid Products',
        productIds: ['prod-1', 'prod-2']
      };

      // Only one product exists
      mockContext.db.product.findMany.mockResolvedValue([{ id: 'prod-1' }]);

      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PRODUCTS');
    });

    it('should handle database errors during creation', async () => {
      const requestBody = {
        title: 'Error Collection',
        description: 'This should fail'
      };

      mockContext.db.lookbook.create.mockRejectedValue(new Error('Creation failed'));

      const request = new NextRequest('http://localhost:3000/api/fashion/lookbooks', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_CREATE_FAILED');
    });
  });
});