export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'suspended';

export interface Course {
  id: string;
  storeId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  instructorId: string;
  price: number;
  currency: string;
  duration: number;
  level: CourseLevel;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  modules: CourseModule[];
  instructorName?: string;
  totalStudents?: number;
  averageRating?: number;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnailUrl?: string;
  instructorId: string;
  price: number;
  currency?: string;
  level: CourseLevel;
  category: string;
  tags?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  instructorId?: string;
  price?: number;
  level?: CourseLevel;
  category?: string;
  tags?: string[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPublished: boolean;
  lessons: Lesson[];
  progress?: number;
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: VideoContent | TextContent | QuizContent | AssignmentContent;
  duration: number;
  isPreview: boolean;
  orderIndex: number;
  isPublished: boolean;
  progress?: LessonProgress;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  type: LessonType;
  content: VideoContent | TextContent | QuizContent | AssignmentContent;
  duration: number;
  isPreview?: boolean;
  orderIndex: number;
}

export interface VideoContent {
  type: 'video';
  videoUrl: string;
  thumbnailUrl?: string;
  captionsUrl?: string;
  transcript?: string;
}

export interface TextContent {
  type: 'text';
  content: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface QuizContent {
  type: 'quiz';
  quizId: string;
}

export interface AssignmentContent {
  type: 'assignment';
  instructions: string;
  dueDate?: Date;
  maxPoints: number;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  timeSpent: number;
  lastPosition: number | null;
}

export interface UpdateLessonProgressInput {
  isCompleted?: boolean;
  timeSpent?: number;
  lastPosition?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  progress: number;
  startedAt: Date;
  completedAt: Date | null;
  lastAccessedAt: Date;
  totalTimeSpent: number;
  course?: Course;
  certificate?: Certificate;
}

export interface CreateEnrollmentInput {
  courseId: string;
  studentId: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  questions: QuizQuestion[];
}

export interface CreateQuizInput {
  lessonId: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }> | null;
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
  orderIndex: number;
}

export interface CreateQuizQuestionInput {
  question: string;
  type: QuestionType;
  options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  orderIndex: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  enrollmentId: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  startedAt: Date;
  submittedAt: Date | null;
  timeSpent: number;
  attemptNumber: number;
}

export interface CreateQuizAttemptInput {
  quizId: string;
  enrollmentId: string;
  answers: Record<string, string>;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  templateId: string;
  certificateNumber: string;
  issuedAt: Date;
  downloadUrl: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
}

export interface CertificateTemplate {
  id: string;
  storeId: string;
  name: string;
  templateUrl: string;
  fields: Array<{
    name: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
  }>;
  isDefault: boolean;
}

export interface CreateCertificateTemplateInput {
  name: string;
  templateUrl: string;
  fields: Array<{ name: string; x: number; y: number; fontSize: number; fontFamily: string }>;
  isDefault?: boolean;
}

export interface CourseAnalytics {
  totalEnrollments: number;
  activeStudents: number;
  completedStudents: number;
  completionRate: number;
  averageProgress: number;
  averageTimeToComplete: number;
  revenue: number;
  topPerformingLessons: Array<{
    lessonId: string;
    title: string;
    completionRate: number;
  }>;
  quizStatistics: Array<{
    quizId: string;
    title: string;
    averageScore: number;
    passRate: number;
  }>;
}
