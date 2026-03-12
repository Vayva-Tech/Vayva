/**
 * Lesson Player Add-On
 * 
 * Interactive lesson player with video, quizzes, and progress tracking
 */

import { AddOnDefinition } from '../../types';

export const LESSON_PLAYER_ADDON: AddOnDefinition = {
  id: 'vayva.lesson-player',
  name: 'Lesson Player',
  description: 'Feature-rich lesson player with video support, interactive elements, note-taking, and seamless progress tracking',
  tagline: 'Learn at your own pace',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'PlayCircle',
  tags: ['education', 'lessons', 'player', 'video', 'learning'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['lesson-content', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/lesson-player/thumbnail.png',
    screenshots: ['/addons/lesson-player/screenshot-1.png'],
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
    installCount: 590,
    rating: 4.9,
    reviewCount: 72,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/learn/[course]/[lesson]', title: 'Lesson' },
      { route: '/learn/continue', title: 'Continue Learning' },
    ],
    components: [
      { mountPoint: 'lesson-content', componentName: 'VideoPlayer' },
      { mountPoint: 'page-sidebar', componentName: 'LessonNavigation' },
    ],
    apiRoutes: [
      { path: '/api/lessons/[id]', methods: ['GET', 'PUT'] },
      { path: '/api/lessons/progress', methods: ['POST'] },
    ],
    databaseModels: ['Lesson', 'LessonContent', 'LessonProgress'],
  },
  highlights: [
    'HD video player',
    'Progress tracking',
    'Note taking',
    'Speed control',
    'Offline mode',
  ],
  installTimeEstimate: 3,
};

export const LESSON_PLAYER_MODELS = `
model Lesson {
  id          String   @id @default(cuid())
  sectionId   String
  courseId    String
  slug        String
  title       String
  description String?  @db.Text
  type        LessonType @default(VIDEO)
  sortOrder   Int      @default(0)
  isFree      Boolean  @default(false)
  isPreview   Boolean  @default(false)
  duration    Int      @default(0) // minutes
  thumbnailUrl String?
  contentId   String?
  attachmentCount Int @default(0)
  quizCount   Int      @default(0)
  status      LessonStatus @default(ACTIVE)
  completionRule CompletionRule @default(AUTO)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([sectionId, slug])
  @@index([courseId, sectionId, sortOrder])
  @@index([isFree, isPreview])
}

model LessonContent {
  id          String   @id @default(cuid())
  lessonId    String   @unique
  type        LessonType
  videoUrl    String?
  videoProvider String? // youtube, vimeo, wistia, custom
  videoDuration Int?   // seconds
  audioUrl    String?
  textContent String?  @db.Text
  downloadUrl String?
  attachments Json?    // [{name, url, size}]
  externalUrl String?
  embedCode   String?  @db.Text
  quizId      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model LessonProgress {
  id          String   @id @default(cuid())
  storeId     String
  studentId   String
  courseId    String
  lessonId    String
  status      LessonStatusProgress @default(NOT_STARTED)
  progressPercent Int  @default(0)
  videoProgress Decimal? // seconds watched
  timeSpent   Int      @default(0) // seconds
  startedAt   DateTime?
  completedAt DateTime?
  lastPosition Decimal? // seconds in video
  notes       String?  @db.Text
  bookmarks   Json?    // [{time, note}]
  quizScore   Int?
  quizAttempts Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([studentId, lessonId])
  @@index([storeId, studentId, courseId])
  @@index([status, completedAt])
}

enum LessonType {
  VIDEO
  AUDIO
  TEXT
  QUIZ
  ASSIGNMENT
  LIVE
  DOWNLOAD
  EMBED
  INTERACTIVE
}

enum LessonStatus {
  ACTIVE
  DRAFT
  ARCHIVED
}

enum LessonStatusProgress {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum CompletionRule {
  AUTO
  MANUAL
  QUIZ_PASS
  TIME_SPENT
}
`;

export default LESSON_PLAYER_ADDON;
