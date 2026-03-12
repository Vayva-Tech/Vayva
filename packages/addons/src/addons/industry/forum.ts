/**
 * Forum Add-On
 * 
 * Community discussion forum for courses
 */

import { AddOnDefinition } from '../../types';

export const FORUM_ADDON: AddOnDefinition = {
  id: 'vayva.forum',
  name: 'Course Forum',
  description: 'Community discussion forum with topics, replies, reactions, and moderation tools for course collaboration',
  tagline: 'Learn together',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'MessageSquare',
  tags: ['education', 'forum', 'community', 'discussion', 'collaboration'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['page-sidebar', 'footer-section'],
  previewImages: {
    thumbnail: '/addons/forum/thumbnail.png',
    screenshots: ['/addons/forum/screenshot-1.png'],
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
    rating: 4.6,
    reviewCount: 52,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/forum', title: 'Discussion Forum' },
      { route: '/forum/topic/[id]', title: 'Topic' },
      { route: '/forum/new', title: 'New Topic' },
    ],
    components: [
      { mountPoint: 'page-sidebar', componentName: 'ForumTopics' },
      { mountPoint: 'footer-section', componentName: 'CommunityStats' },
    ],
    apiRoutes: [
      { path: '/api/forum/topics', methods: ['GET', 'POST'] },
      { path: '/api/forum/replies', methods: ['POST'] },
    ],
    databaseModels: ['ForumTopic', 'ForumReply', 'ForumReaction'],
  },
  highlights: [
    'Topic threads',
    'Rich text replies',
    'Reactions & likes',
    'Moderation tools',
    'Course-specific forums',
  ],
  installTimeEstimate: 4,
};

export const FORUM_MODELS = `
model ForumTopic {
  id          String   @id @default(cuid())
  storeId     String
  courseId    String?
  categoryId  String?
  authorId    String
  title       String
  content     String   @db.Text
  isPinned    Boolean  @default(false)
  isLocked    Boolean  @default(false)
  isAnnouncement Boolean @default(false)
  viewCount   Int      @default(0)
  replyCount  Int      @default(0)
  lastReplyAt DateTime?
  lastReplyBy String?
  tags        String[]
  status      TopicStatus @default(OPEN)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, courseId])
  @@index([isPinned, lastReplyAt])
  @@index([status, createdAt])
}

model ForumReply {
  id          String   @id @default(cuid())
  topicId     String
  parentId    String?  // for threaded replies
  authorId    String
  content     String   @db.Text
  isSolution  Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  deletedBy   String?
  deletedAt   DateTime?
  deletionReason String?
  upvotes     Int      @default(0)
  attachments Json?    // [{name, url}]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([topicId, createdAt])
  @@index([parentId])
  @@index([isSolution])
}

model ForumReaction {
  id          String   @id @default(cuid())
  storeId     String
  targetType  String   // TOPIC, REPLY
  targetId    String
  userId      String
  type        ReactionType @default(LIKE)
  createdAt   DateTime @default(now())
  
  @@unique([targetType, targetId, userId])
  @@index([targetId, type])
}

enum TopicStatus {
  OPEN
  CLOSED
  RESOLVED
  ARCHIVED
}

enum ReactionType {
  LIKE
  HELPFUL
  THANKS
  LOVE
}
`;

export default FORUM_ADDON;
