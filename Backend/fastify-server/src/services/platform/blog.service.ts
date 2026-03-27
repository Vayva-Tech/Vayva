import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BlogService {
  constructor(private readonly db = prisma) {}

  async getPosts(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.authorId) where.authorId = filters.authorId;

    const [posts, total] = await Promise.all([
      this.db.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          categories: true,
          _count: {
            select: { comments: true, views: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.blogPost.count({ where }),
    ]);

    return { posts, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createPost(storeId: string, postData: any) {
    const { title, slug, content, excerpt, coverImage, authorId, categories, tags } = postData;

    const post = await this.db.blogPost.create({
      data: {
        id: `bp-${Date.now()}`,
        storeId,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        authorId,
        status: 'draft',
        categories: categories ? {
          connect: categories.map((id: string) => ({ id })),
        } : undefined,
        tags: tags || [],
      },
      include: { author: true, categories: true },
    });

    logger.info(`[Blog] Created post ${post.id}`);
    return post;
  }

  async publishPost(postId: string, storeId: string) {
    const post = await this.db.blogPost.findFirst({
      where: { id: postId },
    });

    if (!post || post.storeId !== storeId) {
      throw new Error('Post not found');
    }

    const published = await this.db.blogPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
      include: { author: true, categories: true },
    });

    logger.info(`[Blog] Published post ${postId}`);
    return published;
  }

  async updatePost(postId: string, storeId: string, updates: any) {
    const post = await this.db.blogPost.findFirst({
      where: { id: postId },
    });

    if (!post || post.storeId !== storeId) {
      throw new Error('Post not found');
    }

    const updated = await this.db.blogPost.update({
      where: { id: postId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.content && { content: updates.content }),
        ...(updates.excerpt && { excerpt: updates.excerpt }),
        ...(updates.coverImage !== undefined && { coverImage: updates.coverImage }),
      },
      include: { author: true, categories: true },
    });

    logger.info(`[Blog] Updated post ${postId}`);
    return updated;
  }

  async deletePost(postId: string, storeId: string) {
    const post = await this.db.blogPost.findFirst({
      where: { id: postId },
    });

    if (!post || post.storeId !== storeId) {
      throw new Error('Post not found');
    }

    await this.db.blogPost.delete({
      where: { id: postId },
    });

    logger.info(`[Blog] Deleted post ${postId}`);
    return { success: true };
  }

  async getCalendar(storeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const posts = await this.db.blogPost.findMany({
      where: {
        storeId,
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'asc' },
    });

    return { year, month, posts };
  }

  async getDashboardStats(storeId: string) {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalComments,
      subscribersCount,
    ] = await Promise.all([
      this.db.blogPost.count({ where: { storeId } }),
      this.db.blogPost.count({ where: { storeId, status: 'published' } }),
      this.db.blogPost.count({ where: { storeId, status: 'draft' } }),
      this.db.blogView.count({ where: { post: { storeId } } }),
      this.db.blogComment.count({ where: { post: { storeId } } }),
      this.db.newsletterSubscriber.count({ where: { storeId } }),
    ]);

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
      },
      engagement: {
        views: totalViews,
        comments: totalComments,
      },
      subscribers: subscribersCount,
    };
  }

  async getSubscribers(storeId: string) {
    const subscribers = await this.db.newsletterSubscriber.findMany({
      where: { storeId },
      orderBy: { subscribedAt: 'desc' },
    });

    return subscribers;
  }

  async addSubscriber(storeId: string, email: string) {
    const existing = await this.db.newsletterSubscriber.findFirst({
      where: { storeId, email },
    });

    if (existing) {
      throw new Error('Email already subscribed');
    }

    const subscriber = await this.db.newsletterSubscriber.create({
      data: {
        id: `sub-${Date.now()}`,
        storeId,
        email,
        status: 'active',
      },
    });

    logger.info(`[Blog] Added subscriber ${subscriber.id}`);
    return subscriber;
  }
}
