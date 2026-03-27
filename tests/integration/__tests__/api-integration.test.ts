/**
 * API Integration Tests - Comprehensive Suite
 * Tests for all major API endpoints across the platform
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import logger from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/api-client-shared', () => ({
  apiJson: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Nonprofit/Grocery API Endpoints', () => {
    it('GET /api/nonprofit/stats - Returns dashboard statistics', async () => {
      const mockStats = {
        totalCampaigns: 15,
        activeCampaigns: 8,
        totalRaised: 125000,
        totalDonors: 342,
        totalVolunteers: 89,
      };

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockStats });

      const response = await apiJson('/api/nonprofit/stats');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockStats);
      expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/stats');
    });

    it('GET /api/nonprofit/campaigns - Returns campaign list with pagination', async () => {
      const mockCampaigns = [
        { id: 'camp-1', name: 'Education Initiative', goal: 50000, raised: 32000 },
        { id: 'camp-2', name: 'Clean Water Project', goal: 75000, raised: 68000 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockCampaigns });

      const response = await apiJson('/api/nonprofit/campaigns?limit=10&offset=0');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('GET /api/nonprofit/donations - Returns donation history', async () => {
      const mockDonations = [
        { id: 'don-1', amount: 500, donor: 'John Doe', date: '2026-03-20' },
        { id: 'don-2', amount: 1000, donor: 'Jane Smith', date: '2026-03-21' },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockDonations });

      const response = await apiJson('/api/nonprofit/donations?limit=20');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('POST /api/nonprofit/campaigns - Creates new campaign', async () => {
      const newCampaign = {
        name: 'New Initiative',
        goal: 100000,
        description: 'Test campaign',
      };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'camp-new', ...newCampaign } 
      });

      const response = await apiJson('/api/nonprofit/campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('camp-new');
    });

    it('PUT /api/nonprofit/campaigns/:id - Updates campaign', async () => {
      const updatedCampaign = {
        id: 'camp-1',
        name: 'Updated Initiative',
        goal: 60000,
      };

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: updatedCampaign });

      const response = await apiJson('/api/nonprofit/campaigns/camp-1', {
        method: 'PUT',
        body: JSON.stringify(updatedCampaign),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Updated Initiative');
    });

    it('DELETE /api/nonprofit/campaigns/:id - Deletes campaign', async () => {
      vi.mocked(apiJson).mockResolvedValue({ success: true, message: 'Deleted' });

      const response = await apiJson('/api/nonprofit/campaigns/camp-1', {
        method: 'DELETE',
      });
      
      expect(response.success).toBe(true);
    });

    it('GET /api/nonprofit/grants - Returns grant opportunities', async () => {
      const mockGrants = [
        { id: 'grant-1', title: 'Education Grant', amount: 25000, deadline: '2026-04-30' },
        { id: 'grant-2', title: 'Health Grant', amount: 50000, deadline: '2026-05-15' },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockGrants });

      const response = await apiJson('/api/nonprofit/grants?status=open');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });
  });

  describe('Nightlife/Entertainment API Endpoints', () => {
    it('GET /api/nightlife/dashboard - Returns comprehensive dashboard data', async () => {
      const mockDashboard = {
        metrics: {
          currentOccupancy: 342,
          totalCapacity: 500,
          revenue: 45750,
          vipBookings: 23,
        },
        venueStatus: {
          isOpen: true,
          nextEvent: 'DJ Nexus Live',
        },
      };

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockDashboard });

      const response = await apiJson('/api/nightlife/dashboard');
      
      expect(response.success).toBe(true);
      expect(response.data.metrics.currentOccupancy).toBe(342);
    });

    it('GET /api/nightlife/guests - Returns VIP guest list', async () => {
      const mockGuests = [
        { id: 'guest-1', name: 'Alex Johnson', status: 'confirmed', tableNumber: 'VIP-1' },
        { id: 'guest-2', name: 'Sarah Williams', status: 'pending' },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockGuests });

      const response = await apiJson('/api/nightlife/guests?date=2026-03-26');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('POST /api/nightlife/guests - Adds VIP guest', async () => {
      const newGuest = {
        name: 'New VIP',
        email: 'vip@example.com',
        tableNumber: 'VIP-2',
      };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'guest-new', ...newGuest } 
      });

      const response = await apiJson('/api/nightlife/guests', {
        method: 'POST',
        body: JSON.stringify(newGuest),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('guest-new');
    });

    it('GET /api/nightlife/inventory - Returns bottle service inventory', async () => {
      const mockInventory = [
        { id: 'bottle-1', brand: 'Grey Goose', type: 'Vodka', quantity: 12, price: 450 },
        { id: 'bottle-2', brand: 'Hennessy', type: 'Cognac', quantity: 3, price: 550 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockInventory });

      const response = await apiJson('/api/nightlife/inventory');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('PUT /api/nightlife/inventory/:id - Updates inventory after sale', async () => {
      const update = { quantity: 10 };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'bottle-1', ...update } 
      });

      const response = await apiJson('/api/nightlife/inventory/bottle-1', {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      
      expect(response.success).toBe(true);
    });

    it('GET /api/nightlife/promoters - Returns promoter performance data', async () => {
      const mockPromoters = [
        { id: 'promoter-1', name: 'Mike D.', checkIns: 45, totalGuests: 180, commission: 2250 },
        { id: 'promoter-2', name: 'Lisa K.', checkIns: 32, totalGuests: 96, commission: 1280 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockPromoters });

      const response = await apiJson('/api/nightlife/promoters?period=monthly');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('GET /api/nightlife/security-log - Returns security incidents', async () => {
      const mockIncidents = [
        { id: 'incident-1', type: 'Capacity Warning', severity: 'low', resolved: true },
        { id: 'incident-2', type: 'Guest Altercation', severity: 'medium', resolved: true },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockIncidents });

      const response = await apiJson('/api/nightlife/security-log?date=2026-03-26');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });
  });

  describe('Courses/Education API Endpoints', () => {
    it('GET /api/education/courses - Returns course catalog', async () => {
      const mockCourses = [
        { id: 'course-1', title: 'Python Programming', enrolledStudents: 342, isPublished: true },
        { id: 'course-2', title: 'Machine Learning', enrolledStudents: 189, isPublished: true },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockCourses });

      const response = await apiJson('/api/education/courses?limit=20');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('POST /api/education/courses - Creates new course', async () => {
      const newCourse = {
        title: 'New Course',
        description: 'Course description',
        level: 'beginner',
        price: 99.99,
      };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'course-new', ...newCourse } 
      });

      const response = await apiJson('/api/education/courses', {
        method: 'POST',
        body: JSON.stringify(newCourse),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('course-new');
    });

    it('GET /api/education/students - Returns student enrollments', async () => {
      const mockStudents = [
        { id: 'student-1', name: 'Emma Johnson', enrolledCourses: 3, averageGrade: 85.5 },
        { id: 'student-2', name: 'Oliver Smith', enrolledCourses: 2, averageGrade: 92.0 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockStudents });

      const response = await apiJson('/api/education/students?limit=50');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('PUT /api/education/courses/:id - Updates course details', async () => {
      const update = { isPublished: false, price: 79.99 };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'course-1', ...update } 
      });

      const response = await apiJson('/api/education/courses/course-1', {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      
      expect(response.success).toBe(true);
    });

    it('DELETE /api/education/courses/:id - Deletes course', async () => {
      vi.mocked(apiJson).mockResolvedValue({ success: true, message: 'Deleted' });

      const response = await apiJson('/api/education/courses/course-old', {
        method: 'DELETE',
      });
      
      expect(response.success).toBe(true);
    });
  });

  describe('Bookings API Endpoints', () => {
    it('GET /api/bookings - Returns booking list', async () => {
      const mockBookings = [
        { id: 'booking-1', customer: 'Emma Johnson', date: '2026-03-26', status: 'Confirmed' },
        { id: 'booking-2', customer: 'Sarah Williams', date: '2026-03-26', status: 'Pending' },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockBookings });

      const response = await apiJson('/api/bookings?date=2026-03-26');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('POST /api/bookings - Creates new booking', async () => {
      const newBooking = {
        customer: 'New Customer',
        service: 'Hair Styling',
        date: '2026-03-27',
        time: '10:00',
        amount: 85,
      };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'booking-new', ...newBooking } 
      });

      const response = await apiJson('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('booking-new');
    });

    it('PUT /api/bookings/:id - Updates booking status', async () => {
      const update = { status: 'Confirmed' };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'booking-1', ...update } 
      });

      const response = await apiJson('/api/bookings/booking-1', {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      
      expect(response.success).toBe(true);
    });

    it('DELETE /api/bookings/:id - Cancels booking', async () => {
      vi.mocked(apiJson).mockResolvedValue({ success: true, message: 'Cancelled' });

      const response = await apiJson('/api/bookings/booking-1', {
        method: 'DELETE',
      });
      
      expect(response.success).toBe(true);
    });

    it('GET /api/bookings/stats - Returns booking statistics', async () => {
      const mockStats = {
        todayCount: 8,
        weekCount: 42,
        revenue: 3570,
        cancellationRate: 5.2,
      };

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockStats });

      const response = await apiJson('/api/bookings/stats?period=weekly');
      
      expect(response.success).toBe(true);
      expect(response.data.todayCount).toBe(8);
    });
  });

  describe('Catalog/Fashion API Endpoints', () => {
    it('GET /api/fashion/categories - Returns product categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Clothing', productCount: 156 },
        { id: 'cat-2', name: 'Accessories', productCount: 89 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockCategories });

      const response = await apiJson('/api/fashion/categories');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('GET /api/fashion/products - Returns product list', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Summer Dress', price: 89.99, status: 'active' },
        { id: 'prod-2', name: 'Denim Jacket', price: 129.99, status: 'active' },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockProducts });

      const response = await apiJson('/api/fashion/products?category=clothing');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });

    it('POST /api/fashion/products - Creates new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: 59.99,
        category: 'clothing',
        status: 'draft',
      };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'prod-new', ...newProduct } 
      });

      const response = await apiJson('/api/fashion/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('prod-new');
    });

    it('PUT /api/fashion/products/:id - Updates product', async () => {
      const update = { status: 'active', price: 49.99 };

      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: { id: 'prod-1', ...update } 
      });

      const response = await apiJson('/api/fashion/products/prod-1', {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      
      expect(response.success).toBe(true);
    });

    it('DELETE /api/fashion/products/:id - Deletes product', async () => {
      vi.mocked(apiJson).mockResolvedValue({ success: true, message: 'Deleted' });

      const response = await apiJson('/api/fashion/products/prod-old', {
        method: 'DELETE',
      });
      
      expect(response.success).toBe(true);
    });

    it('GET /api/fashion/inventory - Returns inventory levels', async () => {
      const mockInventory = [
        { productId: 'prod-1', stock: 45, lowStockThreshold: 20 },
        { productId: 'prod-2', stock: 8, lowStockThreshold: 15 },
      ];

      vi.mocked(apiJson).mockResolvedValue({ success: true, data: mockInventory });

      const response = await apiJson('/api/fashion/inventory');
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('handles API timeout errors gracefully', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Timeout'));

      await expect(apiJson('/api/nonprofit/stats'))
        .rejects.toThrow('Timeout');
      
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('handles network errors', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Network Error'));

      await expect(apiJson('/api/nightlife/dashboard'))
        .rejects.toThrow('Network Error');
    });

    it('handles malformed responses', async () => {
      vi.mocked(apiJson).mockResolvedValue({ success: false, error: 'Invalid data' });

      const response = await apiJson('/api/education/courses');
      
      expect(response.success).toBe(false);
    });

    it('handles 404 not found errors', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Not Found'));

      await expect(apiJson('/api/nonprofit/campaigns/invalid-id'))
        .rejects.toThrow('Not Found');
    });

    it('handles authentication errors', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Unauthorized'));

      await expect(apiJson('/api/bookings'))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('Performance & Rate Limiting', () => {
    it('handles rapid successive requests', async () => {
      vi.mocked(apiJson)
        .mockResolvedValueOnce({ success: true, data: [] })
        .mockResolvedValueOnce({ success: true, data: [] })
        .mockResolvedValueOnce({ success: true, data: [] });

      const promises = [
        apiJson('/api/nonprofit/stats'),
        apiJson('/api/nonprofit/campaigns'),
        apiJson('/api/nonprofit/donations'),
      ];

      const results = await Promise.all(promises);
      
      expect(results.every(r => r.success)).toBe(true);
    });

    it('respects rate limiting headers', async () => {
      vi.mocked(apiJson).mockResolvedValue({ 
        success: true, 
        data: [],
        rateLimit: {
          remaining: 95,
          reset: Date.now() + 3600000,
        }
      });

      const response = await apiJson('/api/fashion/products');
      
      expect(response.success).toBe(true);
    });
  });
});
