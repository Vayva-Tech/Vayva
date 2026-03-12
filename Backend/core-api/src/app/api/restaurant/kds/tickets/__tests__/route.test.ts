import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock the withVayvaAPI wrapper and dependencies
vi.mock('@/lib/api-handler', () => ({
  withVayvaAPI: vi.fn((permission, handler) => handler)
}));

vi.mock('@/lib/team/permissions', () => ({
  PERMISSIONS: {
    RESTAURANT_KDS_VIEW: 'restaurant:kds:view'
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('zod', async () => {
  const actual = await vi.importActual('zod');
  return {
    ...actual,
    z: {
      ...(actual as any).z,
      enum: vi.fn().mockReturnValue({
        optional: vi.fn().mockReturnValue({
          parse: vi.fn((data) => data)
        })
      }),
      string: vi.fn().mockReturnValue({
        transform: vi.fn().mockReturnValue({
          pipe: vi.fn().mockReturnValue({
            default: vi.fn().mockReturnValue({
              parse: vi.fn((data) => data)
            })
          })
        })
      }),
      number: vi.fn().mockReturnValue({
        min: vi.fn().mockReturnValue({
          max: vi.fn().mockReturnValue({
            default: vi.fn().mockReturnValue({
              parse: vi.fn((data) => data)
            })
          })
        })
      })
    }
  };
});

describe('Restaurant KDS Tickets API', () => {
  const mockStoreId = 'test-restaurant-123';
  const mockContext = {
    storeId: mockStoreId,
    user: {
      id: 'test-user-456',
      email: 'manager@test.com',
      firstName: 'Test',
      lastName: 'Manager',
      storeId: mockStoreId,
      storeName: 'Test Restaurant',
      role: 'manager',
      sessionVersion: 1
    },
    db: {
      kitchenTicket: {
        findMany: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn()
      },
      order: {
        findUnique: vi.fn()
      }
    },
    params: {}
  };

  const mockTickets = [
    {
      id: 'ticket-1',
      orderId: 'order-1',
      tableNumber: 'T5',
      status: 'PENDING',
      station: 'GRILL',
      priority: 1,
      estimatedTime: 15,
      items: [{ name: 'Burger', quantity: 2 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: {
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        tableNumber: 'T5',
        status: 'CONFIRMED',
        total: 25.99,
        createdAt: new Date().toISOString()
      }
    },
    {
      id: 'ticket-2',
      orderId: 'order-2',
      tableNumber: 'T3',
      status: 'IN_PROGRESS',
      station: 'SALAD',
      priority: 2,
      estimatedTime: 8,
      items: [{ name: 'Caesar Salad', quantity: 1 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: {
        id: 'order-2',
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        tableNumber: 'T3',
        status: 'CONFIRMED',
        total: 12.50,
        createdAt: new Date().toISOString()
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/restaurant/kds/tickets', () => {
    it('should return tickets with pagination and summary', async () => {
      mockContext.db.kitchenTicket.findMany.mockResolvedValue(mockTickets);
      mockContext.db.kitchenTicket.count.mockResolvedValue(2);
      mockContext.db.kitchenTicket.groupBy.mockResolvedValue([
        { station: 'GRILL', status: 'PENDING', _count: 1 },
        { station: 'SALAD', status: 'IN_PROGRESS', _count: 1 },
        { priority: 1, _count: 1 },
        { priority: 2, _count: 1 }
      ]);

      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets?limit=50&page=1');
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTickets);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
      expect(data.meta.total).toBe(2);
      expect(data.summary).toBeDefined();
      expect(data.summary.stations).toBeDefined();
      expect(data.summary.priorities).toBeDefined();
    });

    it('should filter by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets?status=PENDING');
      
      mockContext.db.kitchenTicket.findMany.mockResolvedValue([mockTickets[0]]);
      mockContext.db.kitchenTicket.count.mockResolvedValue(1);

      await GET(request, mockContext);

      expect(mockContext.db.kitchenTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING'
          })
        })
      );
    });

    it('should filter by station', async () => {
      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets?station=GRILL');
      
      mockContext.db.kitchenTicket.findMany.mockResolvedValue([mockTickets[0]]);
      mockContext.db.kitchenTicket.count.mockResolvedValue(1);

      await GET(request, mockContext);

      expect(mockContext.db.kitchenTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            station: 'GRILL'
          })
        })
      );
    });

    it('should order by priority and creation time', async () => {
      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets');
      
      mockContext.db.kitchenTicket.findMany.mockResolvedValue(mockTickets);
      mockContext.db.kitchenTicket.count.mockResolvedValue(2);

      await GET(request, mockContext);

      expect(mockContext.db.kitchenTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'asc' }
          ]
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets');
      
      mockContext.db.kitchenTicket.findMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('KDS_TICKETS_FETCH_FAILED');
    });

    it('should handle validation errors', async () => {
      // Mock zod to throw validation error
      const zodMock = await import('zod');
      (zodMock.z.enum as any).mockReturnValue({
        optional: vi.fn().mockReturnValue({
          parse: vi.fn().mockImplementation(() => {
            throw new Error('Validation error');
          })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/restaurant/kds/tickets?invalid=param');
      
      const response = await GET(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});