/**
 * Courses Add-On
 * 
 * Course catalog and management system
 */

import { AddOnDefinition } from '../../types';

export const COURSES_ADDON: AddOnDefinition = {
  id: 'vayva.courses',
  name: 'Courses',
  description: 'Complete course management system with catalog, categories, pricing tiers, and enrollment tracking for online education',
  tagline: 'Create and sell courses',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'GraduationCap',
  tags: ['education', 'courses', 'e-learning', 'online', 'teaching'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['hero-section', 'product-grid', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/courses/thumbnail.png',
    screenshots: ['/addons/courses/screenshot-1.png'],
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
    installCount: 680,
    rating: 4.8,
    reviewCount: 85,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/courses', title: 'Course Catalog' },
      { route: '/courses/[slug]', title: 'Course Details' },
      { route: '/courses/enroll', title: 'Enroll' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'CourseHero' },
      { mountPoint: 'product-grid', componentName: 'CourseGrid' },
    ],
    apiRoutes: [
      { path: '/api/courses', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/courses/enroll', methods: ['POST'] },
    ],
    databaseModels: ['Course', 'CourseCategory', 'CourseSection', 'CourseEnrollment'],
  },
  highlights: [
    'Course catalog',
    'Categories & filters',
    'Pricing tiers',
    'Enrollment tracking',
    'Course progress',
  ],
  installTimeEstimate: 4,
};

export const COURSES_MODELS = `
model Course {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  title       String
  subtitle    String?
  description String   @db.Text
  shortDescription String?
  categoryId  String?
  instructorId String
  level       CourseLevel @default(BEGINNER)
  status      CourseStatus @default(DRAFT)
  price       Decimal  @default(0)
  comparePrice Decimal?
  currency    String   @default("NGN")
  duration    Int?     // minutes
  isFeatured  Boolean  @default(false)
  thumbnailUrl String?
  promoVideoUrl String?
  certificateEnabled Boolean @default(true)
  maxStudents Int?
  enrollmentCount Int    @default(0)
  rating      Decimal?
  reviewCount Int      @default(0)
  tags        String[]
  requirements String?  @db.Text
  whatYouLearn String[]
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, status, publishedAt])
  @@index([categoryId])
  @@index([isFeatured])
}

model CourseCategory {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  name        String
  description String?
  icon        String?
  color       String?
  parentId    String?
  sortOrder   Int      @default(0)
  courseCount Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, isActive])
}

model CourseSection {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  description String?
  sortOrder   Int      @default(0)
  isFree      Boolean  @default(false)
  lessonCount Int      @default(0)
  duration    Int      @default(0) // minutes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([courseId, sortOrder])
}

model CourseEnrollment {
  id          String   @id @default(cuid())
  storeId     String
  courseId    String
  studentId   String
  status      EnrollmentStatus @default(ACTIVE)
  progress    Int      @default(0) // percentage
  startedAt   DateTime?
  completedAt DateTime?
  expiredAt   DateTime?
  lastAccessedAt DateTime?
  totalTimeSpent Int    @default(0) // minutes
  certificateIssued Boolean @default(false)
  certificateUrl String?
  certificateIssuedAt DateTime?
  paymentId   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([courseId, studentId])
  @@index([storeId, studentId])
  @@index([status, progress])
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
  ALL_LEVELS
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  SUSPENDED
  REFUNDED
}
`;

export default COURSES_ADDON;
