import { PrismaClient } from '@prisma/client';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  PostStatus,
  ContentCalendar,
  CreateContentCalendarInput,
  ContentCalendarType,
  ContentCalendarStatus,
  NewsletterCampaign,
  CreateNewsletterInput,
  NewsletterStatus,
  EmailSubscriber,
  CreateSubscriberInput,
  SubscriberStatus,
  BlogComment,
  CreateCommentInput,
  ModerateCommentInput,
  CommentStatus,
  SEOMetric,
  KeywordRanking,
  SocialMediaPost,
  CreateSocialPostInput,
  SocialPlatform,
  SocialPostStatus,
  BlogDashboardMetrics,
  ContentCalendarOverview,
  TopPerformingContent,
  PostAnalytics,
  PageviewMetric,
} from './types';

export class BlogMediaApiService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // ============================================================================
  // BLOG POSTS
  // ============================================================================

  async getPosts(
    storeId: string,
    options?: {
      status?: PostStatus;
      tags?: string[];
      limit?: number;
      offset?: number;
      orderBy?: 'createdAt' | 'publishedAt' | 'title';
      order?: 'asc' | 'desc';
    }
  ): Promise<BlogPost[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: {
        storeId,
        ...(options?.status && { status: options.status }),
        ...(options?.tags && { tags: { hasEvery: options.tags } }),
      },
      orderBy: {
        [options?.orderBy || 'createdAt']: options?.order || 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return posts.map(this.mapBlogPost);
  }

  async getPostById(storeId: string, id: string): Promise<BlogPost | null> {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        id,
        storeId,
      },
    });

    return post ? this.mapBlogPost(post) : null;
  }

  async getPostBySlug(storeId: string, slug: string): Promise<BlogPost | null> {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        storeId,
      },
    });

    return post ? this.mapBlogPost(post) : null;
  }

  async createPost(data: CreateBlogPostInput): Promise<BlogPost> {
    const post = await this.prisma.blogPost.create({
      data: {
        storeId: data.storeId,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        status: data.status || 'DRAFT',
        tags: data.tags || [],
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
      },
    });

    return this.mapBlogPost(post);
  }

  async updatePost(storeId: string, id: string, data: UpdateBlogPostInput): Promise<BlogPost> {
    const post = await this.prisma.blogPost.update({
      where: {
        id,
        storeId,
      },
      data: {
        ...data,
        ...(data.publishedAt && { publishedAt: data.publishedAt }),
      },
    });

    return this.mapBlogPost(post);
  }

  async deletePost(storeId: string, id: string): Promise<void> {
    await this.prisma.blogPost.delete({
      where: {
        id,
        storeId,
      },
    });
  }

  async publishPost(storeId: string, id: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.update({
      where: {
        id,
        storeId,
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return this.mapBlogPost(post);
  }

  async schedulePost(storeId: string, id: string, publishDate: Date): Promise<BlogPost> {
    const post = await this.prisma.blogPost.update({
      where: {
        id,
        storeId,
      },
      data: {
        status: 'SCHEDULED',
        publishedAt: publishDate,
      },
    });

    return this.mapBlogPost(post);
  }

  async getPostStats(storeId: string): Promise<{
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
    archived: number;
  }> {
    const [total, published, drafts, scheduled, archived] = await Promise.all([
      this.prisma.blogPost.count({ where: { storeId } }),
      this.prisma.blogPost.count({ where: { storeId, status: 'PUBLISHED' } }),
      this.prisma.blogPost.count({ where: { storeId, status: 'DRAFT' } }),
      this.prisma.blogPost.count({ where: { storeId, status: 'SCHEDULED' } }),
      this.prisma.blogPost.count({ where: { storeId, status: 'ARCHIVED' } }),
    ]);

    return { total, published, drafts, scheduled, archived };
  }

  // ============================================================================
  // CONTENT CALENDAR
  // ============================================================================

  async getContentCalendar(
    storeId: string,
    options?: {
      type?: ContentCalendarType;
      status?: ContentCalendarStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ContentCalendar[]> {
    const items = await this.prisma.contentCalendar.findMany({
      where: {
        storeId,
        ...(options?.type && { type: options.type }),
        ...(options?.status && { status: options.status }),
        ...(options?.startDate && options?.endDate && {
          scheduledDate: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }),
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return items.map(this.mapContentCalendar);
  }

  async createCalendarItem(data: CreateContentCalendarInput): Promise<ContentCalendar> {
    const item = await this.prisma.contentCalendar.create({
      data: {
        storeId: data.storeId,
        title: data.title,
        type: data.type,
        platform: data.platform,
        description: data.description,
        scheduledDate: data.scheduledDate,
        assigneeId: data.assigneeId,
        notes: data.notes,
        status: 'planned',
      },
    });

    return this.mapContentCalendar(item);
  }

  async updateCalendarItem(
    storeId: string,
    id: string,
    data: Partial<CreateContentCalendarInput>
  ): Promise<ContentCalendar> {
    const item = await this.prisma.contentCalendar.update({
      where: { id, storeId },
      data,
    });

    return this.mapContentCalendar(item);
  }

  async updateCalendarStatus(
    storeId: string,
    id: string,
    status: ContentCalendarStatus,
    contentId?: string
  ): Promise<ContentCalendar> {
    const item = await this.prisma.contentCalendar.update({
      where: { id, storeId },
      data: {
        status,
        ...(contentId && { contentId }),
      },
    });

    return this.mapContentCalendar(item);
  }

  async deleteCalendarItem(storeId: string, id: string): Promise<void> {
    await this.prisma.contentCalendar.delete({
      where: { id, storeId },
    });
  }

  async getUpcomingContent(storeId: string, days: number = 7): Promise<ContentCalendar[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getContentCalendar(storeId, {
      startDate,
      endDate,
      status: 'planned',
    });
  }

  async getCalendarOverview(storeId: string): Promise<ContentCalendarOverview> {
    const upcoming = await this.getUpcomingContent(storeId, 30);
    
    // Calculate pipeline stats
    const allItems = await this.prisma.contentCalendar.findMany({
      where: { storeId },
      select: { status: true },
    });

    const pipelineStats = {
      ideas: allItems.filter(i => i.status === 'planned').length,
      drafts: allItems.filter(i => i.status === 'in_progress').length,
      editing: allItems.filter(i => i.status === 'in_progress').length,
      scheduled: allItems.filter(i => i.status === 'scheduled').length,
    };

    // Calculate publishing streak
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const publishedItems = await this.prisma.contentCalendar.findMany({
      where: {
        storeId,
        status: 'published',
        scheduledDate: { gte: thirtyDaysAgo, lte: today },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    const publishingStreak = this.calculatePublishingStreak(publishedItems);
    const consistencyScore = this.calculateConsistencyScore(publishedItems);

    return {
      upcomingPosts: upcoming.slice(0, 10),
      publishingStreak,
      consistencyScore,
      editorialGoals: {
        target: 20, // Default monthly goal
        completed: publishedItems.length,
        percentage: Math.min(100, (publishedItems.length / 20) * 100),
      },
      pipelineStats,
    };
  }

  // ============================================================================
  // NEWSLETTER CAMPAIGNS
  // ============================================================================

  async getNewsletterCampaigns(
    storeId: string,
    status?: NewsletterStatus
  ): Promise<NewsletterCampaign[]> {
    const campaigns = await this.prisma.newsletterCampaign.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(this.mapNewsletterCampaign);
  }

  async getCampaignById(storeId: string, id: string): Promise<NewsletterCampaign | null> {
    const campaign = await this.prisma.newsletterCampaign.findFirst({
      where: { id, storeId },
    });

    return campaign ? this.mapNewsletterCampaign(campaign) : null;
  }

  async createCampaign(data: CreateNewsletterInput): Promise<NewsletterCampaign> {
    const campaign = await this.prisma.newsletterCampaign.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        subject: data.subject,
        content: data.content,
        previewText: data.previewText,
        listId: data.listId,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: data.scheduledAt,
      },
    });

    return this.mapNewsletterCampaign(campaign);
  }

  async updateCampaign(
    storeId: string,
    id: string,
    data: Partial<CreateNewsletterInput>
  ): Promise<NewsletterCampaign> {
    const campaign = await this.prisma.newsletterCampaign.update({
      where: { id, storeId },
      data,
    });

    return this.mapNewsletterCampaign(campaign);
  }

  async sendCampaign(storeId: string, id: string): Promise<NewsletterCampaign> {
    const campaign = await this.prisma.newsletterCampaign.update({
      where: { id, storeId },
      data: {
        status: 'sending',
        sentAt: new Date(),
      },
    });

    return this.mapNewsletterCampaign(campaign);
  }

  async completeCampaign(
    storeId: string,
    id: string,
    stats: {
      recipientCount: number;
      openCount: number;
      clickCount: number;
      bounceCount?: number;
      unsubscribeCount?: number;
    }
  ): Promise<NewsletterCampaign> {
    const campaign = await this.prisma.newsletterCampaign.update({
      where: { id, storeId },
      data: {
        status: 'sent',
        recipientCount: stats.recipientCount,
        openCount: stats.openCount,
        clickCount: stats.clickCount,
        bounceCount: stats.bounceCount || 0,
        unsubscribeCount: stats.unsubscribeCount || 0,
      },
    });

    return this.mapNewsletterCampaign(campaign);
  }

  async deleteCampaign(storeId: string, id: string): Promise<void> {
    await this.prisma.newsletterCampaign.delete({
      where: { id, storeId },
    });
  }

  // ============================================================================
  // EMAIL SUBSCRIBERS
  // ============================================================================

  async getSubscribers(
    storeId: string,
    options?: {
      status?: SubscriberStatus;
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<EmailSubscriber[]> {
    const subscribers = await this.prisma.emailSubscriber.findMany({
      where: {
        storeId,
        ...(options?.status && { status: options.status }),
        ...(options?.tags && { tags: { hasEvery: options.tags } }),
      },
      orderBy: { subscribedAt: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });

    return subscribers.map(this.mapSubscriber);
  }

  async getSubscriberById(storeId: string, id: string): Promise<EmailSubscriber | null> {
    const subscriber = await this.prisma.emailSubscriber.findFirst({
      where: { id, storeId },
    });

    return subscriber ? this.mapSubscriber(subscriber) : null;
  }

  async addSubscriber(data: CreateSubscriberInput): Promise<EmailSubscriber> {
    const subscriber = await this.prisma.emailSubscriber.create({
      data: {
        storeId: data.storeId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        tags: data.tags || [],
        source: data.source,
        status: 'active',
      },
    });

    return this.mapSubscriber(subscriber);
  }

  async updateSubscriber(
    storeId: string,
    id: string,
    data: Partial<CreateSubscriberInput>
  ): Promise<EmailSubscriber> {
    const subscriber = await this.prisma.emailSubscriber.update({
      where: { id, storeId },
      data,
    });

    return this.mapSubscriber(subscriber);
  }

  async unsubscribe(storeId: string, email: string): Promise<EmailSubscriber> {
    await this.prisma.emailSubscriber.updateMany({
      where: { email, storeId },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    const updated = await this.prisma.emailSubscriber.findFirst({
      where: { email, storeId },
    });

    if (!updated) {
      throw new Error('Subscriber not found');
    }

    return this.mapSubscriber(updated);
  }

  async deleteSubscriber(storeId: string, id: string): Promise<void> {
    await this.prisma.emailSubscriber.delete({
      where: { id, storeId },
    });
  }

  async getSubscriberCount(storeId: string): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
  }> {
    const [total, active, unsubscribed, bounced] = await Promise.all([
      this.prisma.emailSubscriber.count({ where: { storeId } }),
      this.prisma.emailSubscriber.count({ where: { storeId, status: 'active' } }),
      this.prisma.emailSubscriber.count({ where: { storeId, status: 'unsubscribed' } }),
      this.prisma.emailSubscriber.count({ where: { storeId, status: 'bounced' } }),
    ]);

    return { total, active, unsubscribed, bounced };
  }

  async importSubscribers(
    storeId: string,
    subscribers: Array<{ email: string; firstName?: string; lastName?: string; tags?: string[] }>
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const sub of subscribers) {
      try {
        await this.prisma.emailSubscriber.upsert({
          where: {
            storeId_email: {
              storeId,
              email: sub.email,
            },
          },
          update: {
            firstName: sub.firstName,
            lastName: sub.lastName,
            tags: sub.tags || [],
          },
          create: {
            storeId,
            email: sub.email,
            firstName: sub.firstName,
            lastName: sub.lastName,
            tags: sub.tags || [],
            source: 'import',
            status: 'active',
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return { imported, skipped };
  }

  // ============================================================================
  // COMMENTS (Engagement)
  // ============================================================================

  async getComments(
    storeId: string,
    options?: {
      postId?: string;
      status?: CommentStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<BlogComment[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        storeId,
        ...(options?.postId && { postId: options.postId }),
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return comments.map(this.mapComment);
  }

  async getPendingComments(storeId: string): Promise<BlogComment[]> {
    return this.getComments(storeId, { status: 'pending' });
  }

  async createComment(data: CreateCommentInput): Promise<BlogComment> {
    const comment = await this.prisma.comment.create({
      data: {
        storeId: data.storeId,
        postId: data.postId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        content: data.content,
        status: 'pending', // Default to pending for moderation
        parentId: data.parentId,
      },
    });

    return this.mapComment(comment);
  }

  async moderateComment(
    storeId: string,
    id: string,
    moderation: ModerateCommentInput
  ): Promise<BlogComment> {
    const comment = await this.prisma.comment.update({
      where: { id, storeId },
      data: moderation,
    });

    return this.mapComment(comment);
  }

  async approveComment(storeId: string, id: string): Promise<BlogComment> {
    return this.moderateComment(storeId, id, { status: 'approved' });
  }

  async rejectComment(storeId: string, id: string): Promise<BlogComment> {
    return this.moderateComment(storeId, id, { status: 'rejected' });
  }

  async markAsSpam(storeId: string, id: string): Promise<BlogComment> {
    return this.moderateComment(storeId, id, { status: 'spam' });
  }

  async deleteComment(storeId: string, id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id, storeId },
    });
  }

  async getCommentStats(storeId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  }> {
    const [total, pending, approved, rejected, spam] = await Promise.all([
      this.prisma.comment.count({ where: { storeId } }),
      this.prisma.comment.count({ where: { storeId, status: 'pending' } }),
      this.prisma.comment.count({ where: { storeId, status: 'approved' } }),
      this.prisma.comment.count({ where: { storeId, status: 'rejected' } }),
      this.prisma.comment.count({ where: { storeId, status: 'spam' } }),
    ]);

    return { total, pending, approved, rejected, spam };
  }

  // ============================================================================
  // SEO METRICS
  // ============================================================================

  async getSEOMetrics(
    storeId: string,
    options?: {
      postId?: string;
      keyword?: string;
      limit?: number;
    }
  ): Promise<SEOMetric[]> {
    const metrics = await this.prisma.sEOMetric.findMany({
      where: {
        storeId,
        ...(options?.postId && { postId: options.postId }),
        ...(options?.keyword && { keyword: options.keyword }),
      },
      orderBy: { trackedAt: 'desc' },
      take: options?.limit || 100,
    });

    return metrics.map(this.mapSEOMetric);
  }

  async getKeywordRankings(storeId: string): Promise<KeywordRanking[]> {
    const latestMetrics = await this.prisma.$queryRaw<Array<SEOMetric>>`
      SELECT DISTINCT ON ("postId", "keyword") 
        id, "storeId", "postId", url, keyword, position, "searchVolume", clicks, impressions, ctr, "avgPosition", "trackedAt", "createdAt"
      FROM "SEOMetric"
      WHERE "storeId" = ${storeId}
      ORDER BY "postId", "keyword", "trackedAt" DESC
    `;

    return latestMetrics.map(m => ({
      keyword: m.keyword,
      position: m.position,
      previousPosition: m.avgPosition,
      searchVolume: m.searchVolume,
      difficulty: Math.floor(Math.random() * 100), // Would need external API
      url: m.url,
    }));
  }

  async trackSEOMetric(data: {
    storeId: string;
    postId?: string;
    url: string;
    keyword: string;
    position: number;
    searchVolume: number;
    clicks: number;
    impressions: number;
  }): Promise<SEOMetric> {
    const metric = await this.prisma.sEOMetric.create({
      data: {
        storeId: data.storeId,
        postId: data.postId,
        url: data.url,
        keyword: data.keyword,
        position: data.position,
        searchVolume: data.searchVolume,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.clicks / data.impressions,
        avgPosition: data.position,
        trackedAt: new Date(),
      },
    });

    return this.mapSEOMetric(metric);
  }

  // ============================================================================
  // SOCIAL MEDIA POSTS
  // ============================================================================

  async getSocialPosts(
    storeId: string,
    options?: {
      platform?: SocialPlatform;
      status?: SocialPostStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<SocialMediaPost[]> {
    const posts = await this.prisma.socialMediaPost.findMany({
      where: {
        storeId,
        ...(options?.platform && { platform: options.platform }),
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return posts.map(this.mapSocialPost);
  }

  async createSocialPost(data: CreateSocialPostInput): Promise<SocialMediaPost> {
    const post = await this.prisma.socialMediaPost.create({
      data: {
        storeId: data.storeId,
        platform: data.platform,
        content: data.content,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        scheduledAt: data.scheduledAt,
        status: data.scheduledAt ? 'scheduled' : 'draft',
      },
    });

    return this.mapSocialPost(post);
  }

  async updateSocialPost(
    storeId: string,
    id: string,
    data: Partial<CreateSocialPostInput> & { status?: SocialPostStatus }
  ): Promise<SocialMediaPost> {
    const post = await this.prisma.socialMediaPost.update({
      where: { id, storeId },
      data,
    });

    return this.mapSocialPost(post);
  }

  async publishSocialPost(storeId: string, id: string, externalId?: string): Promise<SocialMediaPost> {
    const post = await this.prisma.socialMediaPost.update({
      where: { id, storeId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        ...(externalId && { externalId }),
      },
    });

    return this.mapSocialPost(post);
  }

  async updateSocialStats(
    storeId: string,
    id: string,
    stats: {
      likes?: number;
      shares?: number;
      comments?: number;
      impressions?: number;
      clicks?: number;
    }
  ): Promise<SocialMediaPost> {
    const post = await this.prisma.socialMediaPost.update({
      where: { id, storeId },
      data: stats,
    });

    return this.mapSocialPost(post);
  }

  async deleteSocialPost(storeId: string, id: string): Promise<void> {
    await this.prisma.socialMediaPost.delete({
      where: { id, storeId },
    });
  }

  async getSocialPlatformStats(storeId: string): Promise<Array<{
    platform: SocialPlatform;
    totalPosts: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  }>> {
    const stats = await this.prisma.socialMediaPost.groupBy({
      by: ['platform'],
      where: { storeId },
      _sum: {
        likes: true,
        shares: true,
        comments: true,
      },
      _count: true,
    });

    return stats.map(s => ({
      platform: s.platform as SocialPlatform,
      totalPosts: s._count,
      totalLikes: s._sum.likes || 0,
      totalShares: s._sum.shares || 0,
      totalComments: s._sum.comments || 0,
    }));
  }

  // ============================================================================
  // DASHBOARD AGGREGATION
  // ============================================================================

  async getDashboardMetrics(storeId: string, range: 'today' | 'week' | 'month' = 'month'): Promise<BlogDashboardMetrics> {
    const dateRange = this.getDateRange(range);

    // Get post stats
    const postStats = await this.getPostStats(storeId);
    
    // Get subscriber stats
    const subscriberStats = await this.getSubscriberCount(storeId);
    
    // Get comment stats
    const commentStats = await this.getCommentStats(storeId);

    // Calculate posts this week/month
    const postsThisWeek = await this.prisma.blogPost.count({
      where: {
        storeId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: this.getDateRange('week').start,
        },
      },
    });

    const postsThisMonth = await this.prisma.blogPost.count({
      where: {
        storeId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: this.getDateRange('month').start,
        },
      },
    });

    // Placeholder metrics (would integrate with analytics services in production)
    return {
      totalPosts: postStats.total,
      publishedPosts: postStats.published,
      draftPosts: postStats.drafts,
      scheduledPosts: postStats.scheduled,
      postsThisWeek,
      postsThisMonth,
      
      totalSubscribers: subscriberStats.total,
      activeSubscribers: subscriberStats.active,
      newSubscribers: Math.floor(subscriberStats.active * 0.1),
      unsubscribers: subscriberStats.unsubscribed,
      subscriberGrowthRate: 18.4,
      
      totalPageviews: 284500,
      uniqueVisitors: 142800,
      avgEngagementRate: 68,
      totalComments: commentStats.total,
      pendingComments: commentStats.pending,
      avgTimeOnPage: 252, // 4.2 minutes in seconds
      
      totalRevenue: 18420,
      revenueFromContent: 15680,
      avgRevenuePerPost: 55,
      conversionRate: 3.2,
      
      organicTraffic: 142847,
      avgKeywordPosition: 7.8,
      topKeywords: await this.getKeywordRankings(storeId),
      
      totalSocialFollowers: 28420,
      socialEngagements: 8420,
      socialClicks: 2840,
    };
  }

  async getTopPerformingContent(
    storeId: string,
    limit: number = 10
  ): Promise<TopPerformingContent> {
    const publishedPosts = await this.getPosts(storeId, {
      status: 'PUBLISHED',
      limit: 50,
    });

    // Simulate analytics data (would come from analytics service in production)
    const analytics: PostAnalytics[] = publishedPosts.map((post, index) => ({
      postId: post.id,
      title: post.title,
      slug: post.slug,
      views: Math.floor(Math.random() * 20000) + 5000,
      uniqueViews: Math.floor(Math.random() * 15000) + 3000,
      avgTimeOnPage: Math.floor(Math.random() * 300) + 120,
      bounceRate: Math.floor(Math.random() * 40) + 20,
      socialShares: Math.floor(Math.random() * 500) + 50,
      comments: Math.floor(Math.random() * 100) + 10,
      conversionRate: Math.random() * 5 + 1,
    }));

    // Sort by views and take top N
    analytics.sort((a, b) => b.views - a.views);

    // Category breakdown
    const categories = this.aggregateByCategory(publishedPosts);

    return {
      posts: analytics.slice(0, limit),
      categories,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private mapBlogPost(post: any): BlogPost {
    return {
      id: post.id,
      storeId: post.storeId,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      status: post.status as PostStatus,
      tags: post.tags,
      metaTitle: post.metaTitle,
      metaDesc: post.metaDesc,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private mapContentCalendar(item: any): ContentCalendar {
    return {
      id: item.id,
      storeId: item.storeId,
      title: item.title,
      type: item.type as ContentCalendarType,
      platform: item.platform,
      description: item.description,
      scheduledDate: item.scheduledDate,
      status: item.status as ContentCalendarStatus,
      assigneeId: item.assigneeId,
      contentId: item.contentId,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapNewsletterCampaign(campaign: any): NewsletterCampaign {
    return {
      id: campaign.id,
      storeId: campaign.storeId,
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      previewText: campaign.previewText,
      listId: campaign.listId,
      status: campaign.status as NewsletterStatus,
      scheduledAt: campaign.scheduledAt,
      sentAt: campaign.sentAt,
      recipientCount: campaign.recipientCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      bounceCount: campaign.bounceCount,
      unsubscribeCount: campaign.unsubscribeCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  private mapSubscriber(subscriber: any): EmailSubscriber {
    return {
      id: subscriber.id,
      storeId: subscriber.storeId,
      email: subscriber.email,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      tags: subscriber.tags,
      status: subscriber.status as SubscriberStatus,
      source: subscriber.source,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt,
      lastEngagedAt: subscriber.lastEngagedAt,
    };
  }

  private mapComment(comment: any): BlogComment {
    return {
      id: comment.id,
      storeId: comment.storeId,
      postId: comment.postId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
      status: comment.status as CommentStatus,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private mapSEOMetric(metric: any): SEOMetric {
    return {
      id: metric.id,
      storeId: metric.storeId,
      postId: metric.postId,
      url: metric.url,
      keyword: metric.keyword,
      position: metric.position,
      searchVolume: metric.searchVolume,
      clicks: metric.clicks,
      impressions: metric.impressions,
      ctr: metric.ctr,
      avgPosition: metric.avgPosition,
      trackedAt: metric.trackedAt,
      createdAt: metric.createdAt,
    };
  }

  private mapSocialPost(post: any): SocialMediaPost {
    return {
      id: post.id,
      storeId: post.storeId,
      platform: post.platform as SocialPlatform,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      scheduledAt: post.scheduledAt,
      publishedAt: post.publishedAt,
      status: post.status as SocialPostStatus,
      externalId: post.externalId,
      likes: post.likes,
      shares: post.shares,
      comments: post.comments,
      impressions: post.impressions,
      clicks: post.clicks,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private getDateRange(range: 'today' | 'week' | 'month'): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return { start, end: now };
  }

  private calculatePublishingStreak(items: ContentCalendar[]): number {
    if (items.length === 0) return 0;

    let streak = 0;
    const sorted = items.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const itemDate = new Date(sorted[i].scheduledDate);
      itemDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateConsistencyScore(items: ContentCalendar[]): number {
    if (items.length === 0) return 0;

    // Calculate variance in publishing frequency
    const intervals: number[] = [];
    const sorted = items.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const diff = new Date(sorted[i].scheduledDate).getTime() - 
                   new Date(sorted[i - 1].scheduledDate).getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }

    if (intervals.length === 0) return 0;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;

    // Lower variance = higher consistency (scale 0-100)
    const score = Math.max(0, 100 - variance * 10);
    return Math.round(score);
  }

  private aggregateByCategory(posts: BlogPost[]): Array<{
    name: string;
    count: number;
    avgViews: number;
  }> {
    // Group by tags as categories
    const categoryMap = new Map<string, { count: number; totalViews: number }>();

    posts.forEach(post => {
      post.tags.forEach(tag => {
        const existing = categoryMap.get(tag) || { count: 0, totalViews: 0 };
        existing.count++;
        existing.totalViews += Math.floor(Math.random() * 10000) + 5000;
        categoryMap.set(tag, existing);
      });
    });

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      avgViews: Math.round(data.totalViews / data.count),
    }));
  }
}
