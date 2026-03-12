/**
 * Education Industry Type Definitions
 * 
 * Core types and interfaces for the education industry module
 */

import type { z } from 'zod';

// ============================================================================
// Core Data Models
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  instructorName?: string;
  category: string;
  price: number;
  maxStudents: number;
  enrolledStudents: number;
  status: 'draft' | 'published' | 'archived';
  progress: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  thumbnailUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  enrollmentCount: number;
  completedCourses: number;
  inProgressCourses: number;
  overallProgress: number;
  totalLearningTime: number; // in minutes
  lastActiveAt: Date;
  enrolledAt: Date;
  certificatesEarned: number;
  averageGrade?: number;
  atRisk: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  coursesCount: number;
  totalStudents: number;
  averageRating: number;
  reviewCount: number;
  completionRate: number;
  totalRevenue: number;
  responseTime: number; // in hours
  joinedAt: Date;
  isVerified: boolean;
  specialties?: string[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  progress: number;
  grade?: number;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  certificateIssued?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseTitle?: string;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  dueDate: Date;
  totalPoints: number;
  submissionsCount: number;
  gradedCount: number;
  pendingGrading: number;
  averageScore?: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  submissionUrl?: string;
  daysLate?: number;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  certificateNumber: string;
  issuedAt: Date;
  grade?: number;
  verificationCode: string;
  templateUrl: string;
  studentEmail: string;
}

export interface EngagementMetrics {
  overallScore: number; // 0-100
  videoViews: number; // percentage
  quizAttempts: number; // percentage
  forumPosts: number; // percentage
  assignmentsCompleted: number; // percentage
  loginFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    rarely: number;
  };
  discussionForums: {
    activeThreads: number;
    postsToday: number;
    avgResponseTime: number; // in hours
  };
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  overallProgress: number;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    status: 'active' | 'completed' | 'at-risk';
    lastActivity: Date;
    timeSpent: number; // minutes
    assignmentsCompleted: number;
    assignmentsTotal: number;
  }>;
  atRiskReasons?: string[];
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageProgress: number;
  activeLearners: number;
  revenue: number;
  refundRate: number;
  satisfactionScore: number;
  engagementScore: number;
  dropoffPoints: Array<{
    moduleIndex: number;
    moduleName: string;
    dropoffRate: number;
  }>;
}

export interface InstructorPerformance {
  instructorId: string;
  instructorName: string;
  courses: number;
  students: number;
  rating: number;
  reviews: number;
  completionRate: number;
  revenue: number;
  responseTime: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// Dashboard Aggregations
// ============================================================================

export interface EducationDashboardOverview {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  activeStudents: number;
  totalInstructors: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageCompletionRate: number;
  averageSatisfaction: number;
  certificatesIssued: number;
}

export interface EducationDashboardMetrics {
  revenue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  enrollments: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  students: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  completionRate: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  satisfaction: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface EducationDashboardData {
  overview: EducationDashboardOverview;
  metrics: EducationDashboardMetrics;
  courses: Course[];
  students: Student[];
  instructors: Instructor[];
  enrollments: Enrollment[];
  assignments: Assignment[];
  pendingSubmissions: AssignmentSubmission[];
  certificates: Certificate[];
  engagementMetrics: EngagementMetrics;
  studentProgress: StudentProgress[];
  courseAnalytics: CourseAnalytics[];
  atRiskStudents: Student[];
  topPerformers: Student[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetEducationDashboardRequest {
  storeId: string;
  range?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  includeDetails?: boolean;
}

export interface GetEducationDashboardResponse {
  success: boolean;
  data: EducationDashboardData;
  timestamp: string;
  cached?: boolean;
}

export interface GetCourseStatsRequest {
  storeId: string;
  courseId?: string;
  categoryId?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface GetCourseStatsResponse {
  success: boolean;
  data: {
    totalCourses: number;
    activeCourses: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    topCourses: Course[];
    lowPerformingCourses: Course[];
    revenueByCategory: Record<string, number>;
  };
  timestamp: string;
}

export interface GetStudentProgressRequest {
  storeId: string;
  studentId?: string;
  courseId?: string;
  atRiskOnly?: boolean;
}

export interface GetStudentProgressResponse {
  success: boolean;
  data: {
    overallProgress: number;
    totalStudents: number;
    activeStudents: number;
    atRiskCount: number;
    studentProgress: StudentProgress[];
    completionTrend: Array<{
      date: string;
      completions: number;
    }>;
  };
  timestamp: string;
}

export interface GetInstructorPerformanceRequest {
  storeId: string;
  instructorId?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export interface GetInstructorPerformanceResponse {
  success: boolean;
  data: {
    totalInstructors: number;
    averageRating: number;
    averageCompletionRate: number;
    topPerformers: InstructorPerformance[];
    needsSupport: InstructorPerformance[];
    performanceDistribution: Record<string, number>;
  };
  timestamp: string;
}

export interface GetAssignmentsRequest {
  storeId: string;
  courseId?: string;
  status?: 'published' | 'closed';
  pendingGrading?: boolean;
}

export interface GetAssignmentsResponse {
  success: boolean;
  data: {
    totalAssignments: number;
    pendingGrading: number;
    overdueSubmissions: number;
    assignments: Assignment[];
    recentSubmissions: AssignmentSubmission[];
    gradingQueue: AssignmentSubmission[];
  };
  timestamp: string;
}

export interface GenerateCertificateRequest {
  storeId: string;
  studentId: string;
  courseId: string;
  templateId?: string;
}

export interface GenerateCertificateResponse {
  success: boolean;
  data: {
    certificate: Certificate;
    downloadUrl: string;
    verificationUrl: string;
  };
  message?: string;
}

export interface GetCompletionAnalyticsRequest {
  storeId: string;
  courseId?: string;
  period?: 'week' | 'month' | 'quarter';
}

export interface GetCompletionAnalyticsResponse {
  success: boolean;
  data: {
    overallCompletionRate: number;
    completionsThisPeriod: number;
    previousPeriodChange: number;
    courseAnalytics: CourseAnalytics[];
    dropoffAnalysis: Array<{
      courseId: string;
      courseTitle: string;
      dropoffRate: number;
      primaryDropoffPoint: string;
    }>;
  };
  timestamp: string;
}

export interface GetEngagementAnalyticsRequest {
  storeId: string;
  courseId?: string;
  period?: 'week' | 'month';
}

export interface GetEngagementAnalyticsResponse {
  success: boolean;
  data: {
    overallEngagementScore: number;
    activeLearners: number;
    averageSessionDuration: number;
    loginsThisPeriod: number;
    videoViews: number;
    quizAttempts: number;
    forumActivity: number;
    assignmentSubmissions: number;
    engagementTrend: Array<{
      date: string;
      score: number;
      activeLearners: number;
    }>;
  };
  timestamp: string;
}

// ============================================================================
// Event Types for Real-time Updates
// ============================================================================

export type EducationEventType =
  | 'ENROLLMENT_CREATED'
  | 'ENROLLMENT_UPDATED'
  | 'COURSE_PUBLISHED'
  | 'COURSE_UPDATED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'CERTIFICATE_ISSUED'
  | 'STUDENT_PROGRESS_UPDATE'
  | 'INSTRUCTOR_RATING_CHANGE';

export interface EducationEvent {
  type: EducationEventType;
  payload: {
    storeId: string;
    userId?: string;
    courseId?: string;
    studentId?: string;
    instructorId?: string;
    assignmentId?: string;
    enrollmentId?: string;
    certificateId?: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}

// ============================================================================
// Alert & Action Types
// ============================================================================

export interface EducationAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'student' | 'course' | 'instructor' | 'assignment' | 'certificate';
  title: string;
  message: string;
  affectedEntity?: {
    type: 'student' | 'course' | 'instructor' | 'assignment';
    id: string;
    name: string;
  };
  suggestedAction?: {
    title: string;
    href: string;
    icon: string;
  };
  createdAt: Date;
}

export interface EducationSuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
  href: string;
  icon: string;
  estimatedImpact?: string;
}
