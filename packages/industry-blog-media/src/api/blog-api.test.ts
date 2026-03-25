import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlogMediaApiService } from './blog-api';
import type { PrismaClient } from '@vayva/db';

// Mock Prisma
const mockPrisma = {
  blogPost: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  contentCalendar: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  newsletterCampaign: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  emailSubscriber: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  comment: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  sEOMetric: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  socialMediaPost: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
  },
};

describe('BlogMediaApiService', () => {
  let service: BlogMediaApiService;
  const storeId = 'test-store-id';

  beforeEach(() => {
    service = new BlogMediaApiService(mockPrisma as unknown as PrismaClient);
    vi.clearAllMocks();
  });

  describe('Blog Posts', () => {
    describe('getPosts', () => {
      it('should return posts for a store', async () => {
        const mockPosts = [
          {
            id: '1',
            storeId,
            title: 'Test Post',
            slug: 'test-post',
            status: 'PUBLISHED',
            tags: ['tech'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockPrisma.blogPost.findMany.mockResolvedValue(mockPosts);

        const posts = await service.getPosts(storeId);

        expect(posts).toHaveLength(1);
        expect(posts[0].title).toBe('Test Post');
        expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
          where: { storeId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          skip: 0,
        });
      });

      it('should filter by status', async () => {
        mockPrisma.blogPost.findMany.mockResolvedValue([]);

        await service.getPosts(storeId, { status: 'DRAFT' });

        expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
          where: {
            storeId,
            status: 'DRAFT',
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
          skip: 0,
        });
      });

      it('should paginate results', async () => {
        mockPrisma.blogPost.findMany.mockResolvedValue([]);

        await service.getPosts(storeId, { limit: 20, offset: 40 });

        expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
          where: { storeId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          skip: 40,
        });
      });
    });

    describe('createPost', () => {
      it('should create a new blog post', async () => {
        const inputData = {
          storeId,
          title: 'New Post',
          slug: 'new-post',
          status: 'DRAFT' as const,
        };

        const mockCreated = {
          id: '1',
          ...inputData,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.blogPost.create.mockResolvedValue(mockCreated);

        const post = await service.createPost(inputData);

        expect(post.title).toBe('New Post');
        expect(mockPrisma.blogPost.create).toHaveBeenCalledWith({
          data: {
            ...inputData,
            tags: [],
          },
        });
      });
    });

    describe('publishPost', () => {
      it('should publish a draft post', async () => {
        const mockPublished = {
          id: '1',
          storeId,
          title: 'Published Post',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.blogPost.update.mockResolvedValue(mockPublished);

        const post = await service.publishPost(storeId, '1');

        expect(post.status).toBe('PUBLISHED');
        expect(post.publishedAt).toBeDefined();
      });
    });
  });

  describe('Content Calendar', () => {
    describe('getContentCalendar', () => {
      it('should return calendar items', async () => {
        const mockItems = [
          {
            id: '1',
            storeId,
            title: 'Scheduled Post',
            type: 'blog_post',
            scheduledDate: new Date(),
            status: 'planned',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockPrisma.contentCalendar.findMany.mockResolvedValue(mockItems);

        const items = await service.getContentCalendar(storeId);

        expect(items).toHaveLength(1);
        expect(items[0].type).toBe('blog_post');
      });

      it('should filter by date range', async () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        mockPrisma.contentCalendar.findMany.mockResolvedValue([]);

        await service.getContentCalendar(storeId, { startDate, endDate });

        expect(mockPrisma.contentCalendar.findMany).toHaveBeenCalledWith({
          where: {
            storeId,
            scheduledDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { scheduledDate: 'asc' },
        });
      });
    });

    describe('createCalendarItem', () => {
      it('should create a calendar event', async () => {
        const inputData = {
          storeId,
          title: 'Upcoming Post',
          type: 'blog_post' as const,
          scheduledDate: new Date(),
        };

        const mockCreated = {
          id: '1',
          ...inputData,
          status: 'planned',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.contentCalendar.create.mockResolvedValue(mockCreated);

        const item = await service.createCalendarItem(inputData);

        expect(item.status).toBe('planned');
        expect(mockPrisma.contentCalendar.create).toHaveBeenCalledWith({
          data: {
            ...inputData,
            status: 'planned',
          },
        });
      });
    });
  });

  describe('Newsletter Subscribers', () => {
    describe('getSubscribers', () => {
      it('should return subscriber list', async () => {
        const mockSubscribers = [
          {
            id: '1',
            storeId,
            email: 'test@example.com',
            status: 'active',
            subscribedAt: new Date(),
          },
        ];

        mockPrisma.emailSubscriber.findMany.mockResolvedValue(mockSubscribers);

        const subscribers = await service.getSubscribers(storeId);

        expect(subscribers).toHaveLength(1);
        expect(subscribers[0].email).toBe('test@example.com');
      });
    });

    describe('addSubscriber', () => {
      it('should add a new subscriber', async () => {
        const inputData = {
          storeId,
          email: 'new@example.com',
        };

        const mockCreated = {
          id: '1',
          ...inputData,
          status: 'active',
          tags: [],
          subscribedAt: new Date(),
        };

        mockPrisma.emailSubscriber.create.mockResolvedValue(mockCreated);

        const subscriber = await service.addSubscriber(inputData);

        expect(subscriber.status).toBe('active');
      });
    });

    describe('getSubscriberCount', () => {
      it('should return subscriber counts', async () => {
        mockPrisma.emailSubscriber.count
          .mockResolvedValueOnce(100) // total
          .mockResolvedValueOnce(95)  // active
          .mockResolvedValueOnce(5);   // unsubscribed

        const counts = await service.getSubscriberCount(storeId);

        expect(counts.total).toBe(100);
        expect(counts.active).toBe(95);
        expect(counts.unsubscribed).toBe(5);
      });
    });
  });

  describe('Dashboard Metrics', () => {
    it('should aggregate dashboard metrics', async () => {
      // Mock post stats
      mockPrisma.blogPost.count
        .mockResolvedValueOnce(50)  // total
        .mockResolvedValueOnce(35)  // published
        .mockResolvedValueOnce(10)  // drafts
        .mockResolvedValueOnce(5);   // scheduled

      // Mock subscriber stats
      mockPrisma.emailSubscriber.count
        .mockResolvedValueOnce(1000) // total
        .mockResolvedValueOnce(950)  // active
        .mockResolvedValueOnce(50);   // unsubscribed

      // Mock comment stats
      mockPrisma.comment.count
        .mockResolvedValueOnce(200)  // total
        .mockResolvedValueOnce(15)   // pending
        .mockResolvedValueOnce(180)  // approved
        .mockResolvedValueOnce(3)    // rejected
        .mockResolvedValueOnce(2);    // spam

      const metrics = await service.getDashboardMetrics(storeId, 'month');

      expect(metrics.totalPosts).toBe(50);
      expect(metrics.publishedPosts).toBe(35);
      expect(metrics.draftPosts).toBe(10);
      expect(metrics.totalSubscribers).toBe(1000);
      expect(metrics.totalComments).toBe(200);
      expect(metrics.pendingComments).toBe(15);
    });
  });
});
