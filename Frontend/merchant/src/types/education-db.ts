import type { Prisma } from "@vayva/db";

// ============================================================================
// Course Related Types
// ============================================================================

export type CourseWithModules = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: { lessons: true };
    };
    _count: {
      select: { enrollments: true };
    };
  };
}>;

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: { lessons: true };
    };
    _count: {
      select: { enrollments: true };
    };
  };
}>;

// ============================================================================
// Module Related Types
// ============================================================================

export type CourseModuleWithLessons = Prisma.CourseModuleGetPayload<{
  include: { lessons: true };
}>;

// ============================================================================
// Lesson Related Types
// ============================================================================

// ============================================================================
// Enrollment Related Types
// ============================================================================

export type EnrollmentWithCourse = Prisma.EnrollmentGetPayload<{
  include: {
    course: {
      include: {
        modules: {
          include: { lessons: true };
        };
      };
    };
    certificate: true;
  };
}>;

export type EnrollmentWithProgress = Prisma.EnrollmentGetPayload<{
  include: {
    course: true;
    progressData: {
      include: { lesson: true };
    };
    certificate: true;
  };
}>;

// ============================================================================
// Quiz Related Types
// ============================================================================

export type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: { questions: true };
}>;

// ============================================================================
// Certificate Related Types
// ============================================================================

export type CertificateWithEnrollment = Prisma.CertificateGetPayload<{
  include: {
    enrollment: {
      include: {
        course: true;
      };
    };
  };
}>;

// ============================================================================
// Analytics Related Types
// ============================================================================

export type LessonProgressWithLesson = Prisma.LessonProgressGetPayload<{
  include: { lesson: true };
}>;

export type QuizAttemptWithQuiz = Prisma.QuizAttemptGetPayload<{
  include: { quiz: true };
}>;

// ============================================================================
// Raw Database Types for Mappers
// ============================================================================

export interface RawCourse {
  id: string;
  storeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  instructorId: string;
  price: { toNumber(): number } | number;
  currency: string;
  duration: number;
  level: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  modules?: RawModule[];
  _count?: { enrollments?: number };
}

export interface RawModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPublished: boolean;
  lessons?: RawLesson[];
}

export interface RawLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: string;
  content: Prisma.JsonValue;
  duration: number;
  isPreview: boolean;
  orderIndex: number;
  isPublished: boolean;
}

export interface RawEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: string;
  progress: { toNumber(): number } | number;
  startedAt: Date;
  completedAt: Date | null;
  lastAccessedAt: Date;
  totalTimeSpent: number;
  course?: RawCourse;
  certificate?: RawCertificate | null;
}

export interface RawCertificate {
  id: string;
  enrollmentId: string;
  templateId: string;
  certificateNumber: string;
  issuedAt: Date;
  downloadUrl: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
}

export interface RawQuiz {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  questions?: RawQuizQuestion[];
}

export interface RawQuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: string;
  options: unknown;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  orderIndex: number;
}

export interface RawQuizAttempt {
  id: string;
  quizId: string;
  enrollmentId: string;
  answers: unknown;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  startedAt: Date;
  submittedAt: Date | null;
  timeSpent: number;
  attemptNumber: number;
  quiz?: RawQuiz;
}

export interface RawCertificateTemplate {
  id: string;
  storeId: string;
  name: string;
  templateUrl: string;
  fields: unknown;
  isDefault: boolean;
}

export interface RawLessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  timeSpent: number;
  lastPosition: { toNumber(): number } | number | null;
  lesson?: RawLesson;
}
