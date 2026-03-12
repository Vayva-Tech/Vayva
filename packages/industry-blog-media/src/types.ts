import { z } from 'zod';

// ============================================================================
// Blog Post Types
// ============================================================================

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface BlogPost {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  publishedAt?: Date;
  status: PostStatus;
  tags: string[];
  metaTitle?: string;
  metaDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostProduct {
  postId: string;
  productId: string;
}

export interface CreateBlogPostInput {
  storeId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status?: PostStatus;
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status?: PostStatus;
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
  publishedAt?: Date;
}

// ============================================================================
// Content Calendar Types
// ============================================================================

export type ContentCalendarType = 'blog_post' | 'social_media' | 'email' | 'video';
export type ContentCalendarStatus = 'planned' | 'in_progress' | 'published' | 'cancelled';

export interface ContentCalendar {
  id: string;
  storeId: string;
  title: string;
  type: ContentCalendarType;
  platform?: string;
  description?: string;
  scheduledDate: Date;
  status: ContentCalendarStatus;
  assigneeId?: string;
  contentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentCalendarInput {
  storeId: string;
  title: string;
  type: ContentCalendarType;
  platform?: string;
  description?: string;
  scheduledDate: Date;
  assigneeId?: string;
  notes?: string;
}

// ============================================================================
// Newsletter Campaign Types
// ============================================================================

export type NewsletterStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export interface NewsletterCampaign {
  id: string;
  storeId: string;
  name: string;
  subject: string;
  content: string;
  previewText?: string;
  listId: string;
  status: NewsletterStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewsletterInput {
  storeId: string;
  name: string;
  subject: string;
  content: string;
  previewText?: string;
  listId: string;
  scheduledAt?: Date;
}

// ============================================================================
// Email Subscriber Types
// ============================================================================

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced';

export interface EmailSubscriber {
  id: string;
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  status: SubscriberStatus;
  source?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEngagedAt?: Date;
}

export interface CreateSubscriberInput {
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  source?: string;
}

// ============================================================================
// Comment Types (for blog engagement)
// ============================================================================

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface BlogComment {
  id: string;
  storeId: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  storeId: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}

export interface ModerateCommentInput {
  status: CommentStatus;
  adminNote?: string;
}

// ============================================================================
// SEO Metric Types
// ============================================================================

export interface SEOMetric {
  id: string;
  storeId: string;
  postId?: string;
  url: string;
  keyword: string;
  position: number;
  searchVolume: number;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  trackedAt: Date;
  createdAt: Date;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  url: string;
}

export interface SEOAuditResult {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  fix: string;
}

// ============================================================================
// Social Media Types
// ============================================================================

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'pinterest';
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface SocialMediaPost {
  id: string;
  storeId: string;
  platform: SocialPlatform;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: SocialPostStatus;
  externalId?: string;
  likes?: number;
  shares?: number;
  comments?: number;
  impressions?: number;
  clicks?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocialPostInput {
  storeId: string;
  platform: SocialPlatform;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledAt?: Date;
}

export interface SocialPlatformStats {
  platform: SocialPlatform;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  clicks: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface PageviewMetric {
  date: string;
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface PostAnalytics {
  postId: string;
  title: string;
  slug: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  conversionRate: number;
}

export interface EngagementMetric {
  totalEngagements: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  engagementRate: number;
}

export interface ContentFunnelMetrics {
  impressions: number;
  clicks: number;
  reads: number;
  engagements: number;
  conversions: number;
  clickThroughRate: number;
  readThroughRate: number;
  engagementRate: number;
  conversionRate: number;
}

// ============================================================================
// Dashboard Aggregation Types
// ============================================================================

export interface BlogDashboardMetrics {
  // Content Metrics
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  postsThisWeek: number;
  postsThisMonth: number;
  
  // Audience Metrics
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribers: number;
  unsubscribers: number;
  subscriberGrowthRate: number;
  
  // Engagement Metrics
  totalPageviews: number;
  uniqueVisitors: number;
  avgEngagementRate: number;
  totalComments: number;
  pendingComments: number;
  avgTimeOnPage: number;
  
  // Revenue Metrics
  totalRevenue: number;
  revenueFromContent: number;
  avgRevenuePerPost: number;
  conversionRate: number;
  
  // SEO Metrics
  organicTraffic: number;
  avgKeywordPosition: number;
  topKeywords: KeywordRanking[];
  
  // Social Metrics
  totalSocialFollowers: number;
  socialEngagements: number;
  socialClicks: number;
}

export interface ContentCalendarOverview {
  upcomingPosts: ContentCalendar[];
  publishingStreak: number;
  consistencyScore: number;
  editorialGoals: {
    target: number;
    completed: number;
    percentage: number;
  };
  pipelineStats: {
    ideas: number;
    drafts: number;
    editing: number;
    scheduled: number;
  };
}

export interface TopPerformingContent {
  posts: PostAnalytics[];
  categories: {
    name: string;
    count: number;
    avgViews: number;
  }[];
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const CreateBlogPostSchema = z.object({
  storeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  featuredImage: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
});

export const CreateContentCalendarSchema = z.object({
  storeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  type: z.enum(['blog_post', 'social_media', 'email', 'video']),
  platform: z.string().optional(),
  description: z.string().optional(),
  scheduledDate: z.coerce.date(),
  assigneeId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const CreateNewsletterSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(300),
  content: z.string(),
  previewText: z.string().max(100).optional(),
  listId: z.string(),
  scheduledAt: z.coerce.date().optional(),
});

export const CreateCommentSchema = z.object({
  storeId: z.string().uuid(),
  postId: z.string().uuid(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export const ModerateCommentSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'spam']),
  adminNote: z.string().optional(),
});
