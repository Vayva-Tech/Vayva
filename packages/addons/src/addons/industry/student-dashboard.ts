/**
 * Student Dashboard Add-On
 * 
 * Personalized student dashboard with progress, courses, and achievements
 */

import { AddOnDefinition } from '../../types';

export const STUDENT_DASHBOARD_ADDON: AddOnDefinition = {
  id: 'vayva.student-dashboard',
  name: 'Student Dashboard',
  description: 'Comprehensive student dashboard with course progress, achievements, schedule, and personalized learning insights',
  tagline: 'Your learning hub',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'LayoutDashboard',
  tags: ['education', 'dashboard', 'students', 'learning', 'progress'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/student-dashboard/thumbnail.png',
    screenshots: ['/addons/student-dashboard/screenshot-1.png'],
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
    installCount: 610,
    rating: 4.8,
    reviewCount: 67,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/dashboard', title: 'Student Dashboard' },
      { route: '/dashboard/my-courses', title: 'My Courses' },
      { route: '/dashboard/achievements', title: 'Achievements' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'DashboardOverview' },
      { mountPoint: 'page-sidebar', componentName: 'QuickStats' },
    ],
    apiRoutes: [
      { path: '/api/dashboard/stats', methods: ['GET'] },
      { path: '/api/dashboard/activity', methods: ['GET'] },
    ],
    databaseModels: ['StudentDashboard', 'StudentActivity', 'LearningStreak'],
  },
  highlights: [
    'Course progress',
    'Learning streaks',
    'Achievements',
    'Schedule view',
    'Quick actions',
  ],
  installTimeEstimate: 3,
};

export const STUDENT_DASHBOARD_MODELS = `
model StudentDashboard {
  id          String   @id @default(cuid())
  storeId     String
  studentId   String   @unique
  totalCourses Int     @default(0)
  completedCourses Int @default(0)
  inProgressCourses Int @default(0)
  totalCertificates Int @default(0)
  totalTimeSpent Int    @default(0) // minutes
  averageProgress Decimal @default(0)
  currentStreak Int     @default(0) // days
  longestStreak Int     @default(0)
  lastActivityAt DateTime?
  upcomingDeadlines Json? // [{courseId, lessonId, title, dueDate}]
  recentAchievements Json? // [achievementIds]
  pinnedCourses String[] // courseIds
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, studentId])
  @@index([lastActivityAt])
}

model StudentActivity {
  id          String   @id @default(cuid())
  storeId     String
  studentId   String
  type        ActivityType
  courseId    String?
  lessonId    String?
  quizId      String?
  assignmentId String?
  metadata    Json?    // additional context
  occurredAt  DateTime @default(now())
  
  @@index([storeId, studentId, occurredAt])
  @@index([type, occurredAt])
}

model LearningStreak {
  id          String   @id @default(cuid())
  storeId     String
  studentId   String
  date        DateTime
  activitiesCount Int @default(0)
  timeSpent   Int      @default(0) // minutes
  coursesAccessed String[]
  completedLessons String[]
  isStreakDay Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@unique([studentId, date])
  @@index([storeId, studentId, date])
  @@index([isStreakDay])
}

enum ActivityType {
  COURSE_ENROLL
  LESSON_START
  LESSON_COMPLETE
  QUIZ_START
  QUIZ_COMPLETE
  ASSIGNMENT_SUBMIT
  CERTIFICATE_EARN
  NOTE_CREATE
  BOOKMARK_ADD
  FORUM_POST
  LIVE_ATTEND
  LOGIN
}
`;

export default STUDENT_DASHBOARD_ADDON;
