/**
 * Assignments Add-On
 * 
 * Student assignment submission and grading system
 */

import type { AddOnDefinition } from '../../types';

export const ASSIGNMENTS_ADDON: AddOnDefinition = {
  id: 'vayva.assignments',
  name: 'Assignments',
  description: 'Assignment submission system with file uploads, rubric-based grading, peer reviews, and plagiarism detection integration',
  tagline: 'Submit and grade work',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'FileText',
  tags: ['education', 'assignments', 'submission', 'grading', 'homework'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['lesson-content', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/assignments/thumbnail.png',
    screenshots: ['/addons/assignments/screenshot-1.png'],
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
    installCount: 440,
    rating: 4.7,
    reviewCount: 48,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/assignments', title: 'Assignments' },
      { route: '/assignments/[id]', title: 'Assignment Details' },
      { route: '/assignments/submit', title: 'Submit Work' },
    ],
    components: [
      { mountPoint: 'lesson-content', componentName: 'AssignmentDetails' },
      { mountPoint: 'page-sidebar', componentName: 'SubmissionStatus' },
    ],
    apiRoutes: [
      { path: '/api/assignments', methods: ['GET', 'POST', 'PUT'] },
      { path: '/api/assignments/submit', methods: ['POST'] },
      { path: '/api/assignments/grade', methods: ['POST'] },
    ],
    databaseModels: ['Assignment', 'AssignmentSubmission', 'AssignmentGrade'],
  },
  highlights: [
    'File submissions',
    'Rubric grading',
    'Peer reviews',
    'Due date tracking',
    'Grade analytics',
  ],
  installTimeEstimate: 4,
};

export const ASSIGNMENTS_MODELS = `
model Assignment {
  id          String   @id @default(cuid())
  storeId     String
  courseId    String
  lessonId    String?
  title       String
  description String   @db.Text
  instructions String? @db.Text
  type        AssignmentType @default(INDIVIDUAL)
  maxScore    Int      @default(100)
  passingScore Int    @default(60)
  dueDate     DateTime?
  allowLateSubmission Boolean @default(false)
  latePenalty Decimal? // percentage deduction
  maxAttempts Int      @default(1)
  acceptedFileTypes String[] @default(["pdf", "doc", "docx"])
  maxFileSize Int      @default(10) // MB
  rubric      Json?    // [{criterion, maxPoints, description}]
  attachments Json?    // [{name, url}]
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, courseId])
  @@index([isPublished, dueDate])
}

model AssignmentSubmission {
  id          String   @id @default(cuid())
  storeId     String
  assignmentId String
  studentId   String
  attemptNumber Int    @default(1)
  status      SubmissionStatus @default(DRAFT)
  submittedAt DateTime?
  content     String?  @db.Text
  attachments Json?    // [{name, url, size}]
  externalLinks String[]
  isLate      Boolean  @default(false)
  plagiarismScore Decimal?
  plagiarismReportUrl String?
  wordCount   Int?
  timeSpent   Int?     // minutes
  ipAddress   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([assignmentId, studentId, attemptNumber])
  @@index([storeId, studentId])
  @@index([status, submittedAt])
}

model AssignmentGrade {
  id          String   @id @default(cuid())
  storeId     String
  submissionId String
  graderId    String
  score       Decimal
  maxScore    Int
  percentage  Decimal
  passed      Boolean
  feedback    String?  @db.Text
  rubricScores Json?  // {criterionId: score}
  isPublished Boolean @default(false)
  publishedAt DateTime?
  gradedAt    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([submissionId])
  @@index([graderId, gradedAt])
}

enum AssignmentType {
  INDIVIDUAL
  GROUP
  PEER_REVIEW
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADING
  GRADED
  RETURNED
  LATE
}
`;

export default ASSIGNMENTS_ADDON;
