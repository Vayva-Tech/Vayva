import { GET } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock the dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    productVariant: {
      findMany: jest.fn(),
    },
  },
}));

describe('Fashion Inventory Breakdown API', () => {
  const mockSession = {
    user: { id: 'user-123' },
  };

  const mockedPrisma = prisma as jest.Mocked<typeof prisma> & {
    productVariant: { findMany: jest.Mock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/fashion/inventory/breakdown', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/fashion/inventory/breakdown?businessId=biz-123');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if businessId is missing', async () => {
      const request = new NextRequest('http://localhost/api/fashion/inventory/breakdown');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return inventory breakdown successfully', async () => {
      const mockVariants = [
        {
          id: 'var-1',
          productId: 'prod-1',
          sku: 'SKU001',
          size: 'M',
          color: 'Black',
          stockQuantity: 10,
          reservedQuantity: 2,
          reorderPoint: 5,
          cost: 25.00,
          price: 49.99,
          product: {
            name: 'Classic T-Shirt',
            category: { name: 'Tops' },
            collections: [],
          },
        },
      ];
      
      mockedPrisma.productVariant.findMany.mockResolvedValue(mockVariants);
      
      const request = new NextRequest('http://localhost/api/fashion/inventory/breakdown?businessId=biz-123');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toHaveLength(1);
      expect(data.data.summary).toBeDefined();
    });

    it('should filter by category when categoryId is provided', async () => {
      mockedPrisma.productVariant.findMany.mockResolvedValue([]);
      
      const request = new NextRequest('http://localhost/api/fashion/inventory/breakdown?businessId=biz-123&categoryId=cat-1');
      await GET(request);
      
      expect(mockedPrisma.productVariant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      );
    });

    it('should filter by alert type when alertType is provided', async () => {
      const mockVariants = [
        {
          id: 'var-1',
          productId: 'prod-1',
          sku: 'SKU001',
          size: 'M',
          color: 'Black',
          stockQuantity: 0, // Out of stock
          reservedQuantity: 0,
          reorderPoint: 5,
          cost: 25.00,
          price: 49.99,
          product: {
            name: 'Classic T-Shirt',
            category: { name: 'Tops' },
            collections: [],
          },
        },
      ];
      
      mockedPrisma.productVariant.findMany.mockResolvedValue(mockVariants);
      
      const request = new NextRequest('http://localhost/api/fashion/inventory/breakdown?businessId=biz-123&alertType=out_of_stock');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data.items).toHaveLength(1);
      expect(data.data.items[0].alert.status).toBe('out_of_stock');
    });
  });
});