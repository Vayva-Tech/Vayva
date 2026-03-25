/**
 * Portfolio Feed Add-On
 * 
 * Social media style portfolio feed with updates and work-in-progress
 */

import type { AddOnDefinition } from '../../types';

export const PORTFOLIO_FEED_ADDON: AddOnDefinition = {
  id: 'vayva.portfolio-feed',
  name: 'Portfolio Feed',
  description: 'Social media style portfolio feed for sharing work-in-progress, updates, behind-the-scenes content, and daily creative outputs',
  tagline: 'Share your creative journey',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Rss',
  tags: ['creative', 'feed', 'social', 'updates', 'work-in-progress'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'artist', 'freelancer'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/portfolio-feed/thumbnail.png',
    screenshots: ['/addons/portfolio-feed/screenshot-1.png'],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'free',
  },
  stats: {
    installCount: 480,
    rating: 4.5,
    reviewCount: 51,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/feed', title: 'Portfolio Feed' },
      { route: '/feed/[id]', title: 'Feed Post' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'LatestUpdates' },
      { mountPoint: 'page-sidebar', componentName: 'FeedSubscribe' },
    ],
    apiRoutes: [
      { path: '/api/feed', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/feed/subscribe', methods: ['POST'] },
    ],
    databaseModels: ['FeedPost', 'FeedSubscriber', 'FeedComment'],
  },
  highlights: [
    'Chronological feed',
    'Image galleries',
    'Like & reactions',
    'Email subscription',
    'RSS support',
  ],
  installTimeEstimate: 3,
};

export const PORTFOLIO_FEED_MODELS = `
model FeedPost {
  id          String   @id @default(cuid())
  storeId     String
  type        FeedType @default(UPDATE)
  title       String?
  content     String   @db.Text
  projectId   String?
  media       Json?    // [{url, type, caption, thumbnail}]
  tags        String[]
  mood        String?
  location    String?
  isPinned    Boolean  @default(false)
  isPublished Boolean  @default(true)
  publishedAt DateTime @default(now())
  viewCount   Int      @default(0)
  likeCount   Int      @default(0)
  commentCount Int     @default(0)
  shareCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isPublished, publishedAt])
  @@index([type, isPinned])
  @@index([projectId])
}

model FeedSubscriber {
  id          String   @id @default(cuid())
  storeId     String
  email       String
  name        String?
  isVerified  Boolean  @default(false)
  verificationToken String?
  preferences Json?    // {newPosts, projects, tips}
  frequency   String   @default("weekly") // daily, weekly, monthly
  lastSentAt  DateTime?
  isActive    Boolean  @default(true)
  unsubscribedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, email])
  @@index([isActive, frequency])
}

model FeedComment {
  id          String   @id @default(cuid())
  storeId     String
  postId      String
  authorName  String
  authorEmail String?
  authorWebsite String?
  content     String   @db.Text
  isApproved  Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  parentId    String?  // for threaded replies
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([postId, isApproved, createdAt])
  @@index([parentId])
}

enum FeedType {
  UPDATE
  BEHIND_THE_SCENES
  WORK_IN_PROGRESS
  COMPLETED_WORK
  TIP
  INSPIRATION
  ANNOUNCEMENT
  COLLABORATION
}
`;

export default PORTFOLIO_FEED_ADDON;
