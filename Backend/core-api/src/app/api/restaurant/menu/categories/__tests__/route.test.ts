import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock the dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    menuCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('Restaurant Menu Categories API', () => {
  const mockSession = {
    user: { id: 'user-123' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/restaurant/menu/categories', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories?businessId=biz-123');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if businessId is missing', async () => {
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return menu categories successfully', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Appetizers', sortOrder: 1 },
        { id: 'cat-2', name: 'Main Course', sortOrder: 2 },
      ];
      
      const prisma = require('@/lib/prisma').prisma;
      prisma.menuCategory.findMany.mockResolvedValue(mockCategories);
      
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories?businessId=biz-123');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCategories);
    });
  });

  describe('POST /api/restaurant/menu/categories', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should create menu category successfully', async () => {
      const mockCategory = { id: 'cat-1', name: 'Desserts' };
      
      const prisma = require('@/lib/prisma').prisma;
      prisma.menuCategory.findFirst.mockResolvedValue(null);
      prisma.menuCategory.create.mockResolvedValue(mockCategory);
      
      const requestBody = {
        businessId: 'biz-123',
        name: 'Desserts',
        description: 'Sweet treats',
      };
      
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCategory);
    });

    it('should return 409 if category name already exists', async () => {
      const prisma = require('@/lib/prisma').prisma;
      prisma.menuCategory.findFirst.mockResolvedValue({ id: 'cat-1' });
      
      const requestBody = {
        businessId: 'biz-123',
        name: 'Existing Category',
      };
      
      const request = new NextRequest('http://localhost/api/restaurant/menu/categories', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      const response = await POST(request);
      
      expect(response.status).toBe(409);
    });
  });
});