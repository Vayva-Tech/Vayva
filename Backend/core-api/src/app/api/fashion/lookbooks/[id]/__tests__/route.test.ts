import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';

// Mock the withVayvaAPI wrapper and dependencies
vi.mock('@/lib/api-handler', () => ({
  withVayvaAPI: vi.fn((permission, handler) => {
    return async (req: NextRequest, context: any) => {
      // Mock the params resolution
      context.params = Promise.resolve({ id: 'test-lookbook-123' });
      return handler(req, context);
    };
  })
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

describe('Fashion Individual Lookbook API', () => {
  const mockStoreId = 'test-store-123';
  const mockUserId = 'test-user-456';
  const mockLookbookId = 'test-lookbook-123';
  
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
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }
    },
    params: Promise.resolve({ id: mockLookbookId })
  };

  const mockLookbook = {
    id: mockLookbookId,
    storeId: mockStoreId,
    title: 'Test Lookbook',
    description: 'Test description',
    isActive: true,
    coverImage: 'https://example.com/image.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    products: [
      {
        id: 'lp-1',
        productId: 'prod-1',
        product: {
          id: 'prod-1',
          name: 'Test Product',
          price: 29.99,
          images: ['https://example.com/product1.jpg'],
          sku: 'TP001'
        }
      }
    ],
    _count: {
      products: 1
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/fashion/lookbooks/[id]', () => {
    it('should return a specific lookbook with products', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(mockLookbook);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`);
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockLookbookId);
      expect(data.data.products).toHaveLength(1);
      expect(data.data._count.products).toBe(1);
    });

    it('should return 404 for non-existent lookbook', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`);
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockContext.db.lookbook.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`);
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_FETCH_FAILED');
    });
  });

  describe('PUT /api/fashion/lookbooks/[id]', () => {
    it('should update a lookbook successfully', async () => {
      const updateData = {
        title: 'Updated Lookbook Title',
        description: 'Updated description',
        isActive: false
      };

      const updatedLookbook = {
        ...mockLookbook,
        ...updateData,
        updatedBy: mockUserId,
        updatedAt: new Date().toISOString()
      };

      mockContext.db.lookbook.findUnique.mockResolvedValue(mockLookbook);
      mockContext.db.lookbook.update.mockResolvedValue(updatedLookbook);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Lookbook Title');
      expect(data.data.isActive).toBe(false);
      expect(mockContext.db.lookbook.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockLookbookId },
          data: expect.objectContaining({
            ...updateData,
            updatedBy: mockUserId
          })
        })
      );
    });

    it('should return 404 when updating non-existent lookbook', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'New Title' })
      });

      const response = await PUT(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_NOT_FOUND');
    });

    it('should handle update database errors', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(mockLookbook);
      mockContext.db.lookbook.update.mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'New Title' })
      });

      const response = await PUT(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_UPDATE_FAILED');
    });
  });

  describe('DELETE /api/fashion/lookbooks/[id]', () => {
    it('should delete a lookbook successfully', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(mockLookbook);
      mockContext.db.lookbook.delete.mockResolvedValue(undefined);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Lookbook deleted successfully');
      expect(mockContext.db.lookbook.delete).toHaveBeenCalledWith({
        where: { id: mockLookbookId }
      });
    });

    it('should return 404 when deleting non-existent lookbook', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_NOT_FOUND');
    });

    it('should handle delete database errors', async () => {
      mockContext.db.lookbook.findUnique.mockResolvedValue(mockLookbook);
      mockContext.db.lookbook.delete.mockRejectedValue(new Error('Delete failed'));

      const request = new NextRequest(`http://localhost:3000/api/fashion/lookbooks/${mockLookbookId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LOOKBOOK_DELETE_FAILED');
    });
  });
});