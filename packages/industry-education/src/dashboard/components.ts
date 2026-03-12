// ============================================================================
// Education Industry Dashboard Components
// ============================================================================

// Component Props Interfaces for Education Dashboard Sections
// These are used internally by the EducationDashboard component

// Import base types from types module
import type { 
  Course, 
  Student, 
  Instructor, 
  Assignment, 
  AssignmentSubmission,
  EngagementMetrics as BaseEngagementMetrics,
  Certificate,
  Enrollment,
  StudentProgress,
  CourseAnalytics,
  InstructorPerformance
} from '../types';

// Local data interfaces that extend or compose base types
export interface CertificateData {
  issuedThisMonth: number;
  pendingIssuance: number;
  total: number;
  recentCertificates: Array<{
    id: string;
    studentName: string;
    course: string;
    issuedAt: string;
  }>;
}

export interface EnrollmentData {
  monthlyEnrollments: number[];
  activeStudents: number;
  newStudentsThisMonth: number;
  returningStudents: number;
  churnRate: number;
}

export interface RevenueData {
  byCategory: Record<string, number>;
  totalRevenue: number;
  projectedRevenue: number;
  growthRate: number;
}

// ---------------------------------------------------------------------------
// Component Props Interfaces
// ---------------------------------------------------------------------------

export interface CourseProgressProps {
  courses: Course[];
  loading?: boolean;
  className?: string;
}

export interface StudentEngagementProps {
  data: BaseEngagementMetrics;
  loading?: boolean;
  className?: string;
}

export interface AssignmentQueueProps {
  assignments: Assignment[];
  totalPending: number;
  overdue: number;
  loading?: boolean;
  className?: string;
}

export interface InstructorPerformanceProps {
  instructors: Instructor[];
  loading?: boolean;
  className?: string;
}

export interface CertificateIssuanceProps {
  certificates: CertificateData;
  loading?: boolean;
  className?: string;
}

export interface EnrollmentTrendsProps {
  data: EnrollmentData;
  loading?: boolean;
  className?: string;
}

export interface AtRiskStudentsProps {
  students: Student[];
  totalAtRisk: number;
  loading?: boolean;
  className?: string;
}

export interface RevenueBreakdownProps {
  data: RevenueData;
  loading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50';
    case 'completed':
      return 'text-blue-600 bg-blue-50';
    case 'at-risk':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
