/**
 * Quizzes Add-On
 * 
 * Interactive quiz and assessment system
 */

import type { AddOnDefinition } from '../../types';

export const QUIZZES_ADDON: AddOnDefinition = {
  id: 'vayva.quizzes',
  name: 'Quizzes',
  description: 'Interactive quiz builder with multiple question types, auto-grading, timed assessments, and detailed analytics',
  tagline: 'Test knowledge interactively',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'HelpCircle',
  tags: ['education', 'quizzes', 'assessment', 'testing', 'grading'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['lesson-content', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/quizzes/thumbnail.png',
    screenshots: ['/addons/quizzes/screenshot-1.png'],
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
    installCount: 520,
    rating: 4.7,
    reviewCount: 58,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/quiz/[id]', title: 'Take Quiz' },
      { route: '/quiz/[id]/results', title: 'Quiz Results' },
    ],
    components: [
      { mountPoint: 'lesson-content', componentName: 'QuizPlayer' },
      { mountPoint: 'page-sidebar', componentName: 'QuizResults' },
    ],
    apiRoutes: [
      { path: '/api/quizzes', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/quizzes/submit', methods: ['POST'] },
      { path: '/api/quizzes/results', methods: ['GET'] },
    ],
    databaseModels: ['Quiz', 'QuizQuestion', 'QuizAttempt', 'QuizAnswer'],
  },
  highlights: [
    'Multiple question types',
    'Auto-grading',
    'Timed assessments',
    'Question bank',
    'Detailed analytics',
  ],
  installTimeEstimate: 3,
};

export const QUIZZES_MODELS = `
model Quiz {
  id          String   @id @default(cuid())
  storeId     String
  courseId    String?
  lessonId    String?
  title       String
  description String?  @db.Text
  type        QuizType @default(GRADED)
  timeLimit   Int?     // minutes
  passingScore Int     @default(70) // percentage
  maxAttempts Int?     // null = unlimited
  shuffleQuestions Boolean @default(false)
  showCorrectAnswers Boolean @default(true)
  showResultsImmediately Boolean @default(true)
  isPublished Boolean  @default(false)
  questionCount Int    @default(0)
  totalPoints Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, courseId])
  @@index([lessonId])
  @@index([isPublished])
}

model QuizQuestion {
  id          String   @id @default(cuid())
  quizId      String
  type        QuestionType
  question    String   @db.Text
  options     Json?    // [{id, text, isCorrect, explanation}]
  correctAnswer String? // for short_answer, fill_blank
  explanation String?  @db.Text
  points      Int      @default(1)
  mediaUrl    String?
  sortOrder   Int      @default(0)
  isRequired  Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([quizId, sortOrder])
}

model QuizAttempt {
  id          String   @id @default(cuid())
  storeId     String
  quizId      String
  studentId   String
  status      AttemptStatus @default(IN_PROGRESS)
  score       Int?
  percentage  Decimal?
  passed      Boolean?
  timeSpent   Int      @default(0) // seconds
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  attemptNumber Int    @default(1)
  answers     QuizAnswer[]
  ipAddress   String?
  isCheatingSuspected Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([quizId, studentId])
  @@index([status, submittedAt])
}

model QuizAnswer {
  id          String   @id @default(cuid())
  attemptId   String
  questionId  String
  answer      String   @db.Text
  isCorrect   Boolean?
  pointsEarned Int?
  timeSpent   Int      @default(0) // seconds
  feedback    String?  @db.Text
  createdAt   DateTime @default(now())
  
  @@index([attemptId, questionId])
}

enum QuizType {
  GRADED
  PRACTICE
  SURVEY
  POLL
}

enum QuestionType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  SHORT_ANSWER
  ESSAY
  FILL_BLANK
  MATCHING
  ORDERING
  SCALE
  FILE_UPLOAD
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  GRADING
  COMPLETED
  TIME_EXPIRED
  ABANDONED
}
`;

export default QUIZZES_ADDON;
