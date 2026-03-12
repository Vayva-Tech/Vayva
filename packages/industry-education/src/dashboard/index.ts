/**
 * Education Dashboard Configuration
 * 
 * Dashboard layout and configuration for education industry
 */

import type { EducationDashboardData } from '../types';

// Export React dashboard component
export { EducationDashboard } from './EducationDashboard';

// Export component props types (not base types to avoid conflicts)
export type {
  CourseProgressProps,
  StudentEngagementProps,
  AssignmentQueueProps,
  InstructorPerformanceProps,
  CertificateIssuanceProps,
  EnrollmentTrendsProps,
  AtRiskStudentsProps,
  RevenueBreakdownProps,
  CertificateData,
  EnrollmentData,
  RevenueData
} from './components';

/**
 * Education dashboard default configuration
 */
export const EDUCATION_DASHBOARD_CONFIG = {
  // KPI slots for education
  kpiSlots: [
    {
      id: 'revenue',
      label: 'Revenue',
      icon: 'DollarSign',
      format: 'currency',
    },
    {
      id: 'enrollments',
      label: 'Enrollments',
      icon: 'UserPlus',
      format: 'number',
    },
    {
      id: 'students',
      label: 'Active Students',
      icon: 'Users',
      format: 'number',
    },
    {
      id: 'completion_rate',
      label: 'Completion Rate',
      icon: 'CheckCircle',
      format: 'percent',
    },
    {
      id: 'satisfaction',
      label: 'Satisfaction',
      icon: 'Star',
      format: 'rating',
    },
  ],

  // Native sections for education dashboard
  nativeSections: [
    'active_courses',
    'student_progress',
    'assignments_assessments',
    'instructor_performance',
    'certificates',
    'engagement_metrics',
  ] as const,

  // Alert thresholds
  alertThresholds: {
    lowCompletionRate: 40,
    atRiskStudents: 5,
    overdueAssignments: 10,
    emptySlots: 5,
  },

  // Suggested actions
  suggestedActions: [
    {
      id: 'review_low_completion',
      title: 'Review low-completion courses',
      reason: 'Students dropping off',
      conditionKey: 'hasLowCompletionCourses',
      severity: 'warning',
      href: '/dashboard/courses',
      icon: 'BookOpen',
    },
    {
      id: 'intervene_at_risk',
      title: 'Intervene with at-risk students',
      reason: 'Students below 60% progress',
      conditionKey: 'hasAtRiskStudents',
      severity: 'critical',
      href: '/dashboard/students',
      icon: 'UserX',
    },
    {
      id: 'grade_assignments',
      title: 'Grade pending assignments',
      reason: 'Submissions awaiting review',
      conditionKey: 'hasPendingGrading',
      severity: 'info',
      href: '/dashboard/assignments',
      icon: 'ClipboardCheck',
    },
  ],
};

/**
 * Get education dashboard configuration
 */
export function getEducationDashboardConfig() {
  return EDUCATION_DASHBOARD_CONFIG;
}

/**
 * Transform education data for universal dashboard
 */
export function transformEducationDashboardData(
  data: EducationDashboardData
): Record<string, any> {
  return {
    // Map to universal dashboard structure
    kpis: {
      revenue: data.metrics.revenue,
      enrollments: data.metrics.enrollments,
      students: data.metrics.students,
      completion_rate: data.metrics.completionRate,
      satisfaction: data.metrics.satisfaction,
    },
    
    // Education-native sections
    activeCourses: data.courses,
    studentProgress: data.studentProgress,
    assignmentsAssessments: {
      assignments: data.assignments,
      pendingGrading: data.pendingSubmissions,
      gradingQueue: data.pendingSubmissions,
    },
    instructorPerformance: data.instructors.map((inst) => ({
      ...inst,
      performanceScore: inst.averageRating * 20,
    })),
    certificates: data.certificates,
    engagementMetrics: data.engagementMetrics,
    
    // Alerts and insights
    alerts: generateEducationAlerts(data),
    aiInsights: generateAIInsights(data),
  };
}

/**
 * Generate alerts based on education data
 */
function generateEducationAlerts(data: EducationDashboardData): any[] {
  const alerts: any[] = [];

  // At-risk students alert
  if (data.atRiskStudents.length > 5) {
    alerts.push({
      id: 'at_risk_students',
      type: 'critical',
      title: 'High At-Risk Student Count',
      message: `${data.atRiskStudents.length} students are at risk of failing`,
      affectedEntity: {
        type: 'student',
        id: 'multiple',
        name: `${data.atRiskStudents.length} students`,
      },
      suggestedAction: {
        title: 'View At-Risk List',
        href: '/dashboard/students?filter=at-risk',
        icon: 'UserX',
      },
    });
  }

  // Low completion rate alert
  if (data.overview.averageCompletionRate < 60) {
    alerts.push({
      id: 'low_completion',
      type: 'warning',
      title: 'Low Completion Rate',
      message: `Overall completion rate is ${data.overview.averageCompletionRate.toFixed(1)}%`,
      suggestedAction: {
        title: 'Review Courses',
        href: '/dashboard/courses',
        icon: 'BookOpen',
      },
    });
  }

  // Pending grading alert
  if (data.pendingSubmissions.length > 20) {
    alerts.push({
      id: 'pending_grading',
      type: 'warning',
      title: 'Large Grading Queue',
      message: `${data.pendingSubmissions.length} assignments awaiting grading`,
      suggestedAction: {
        title: 'Start Grading',
        href: '/dashboard/assignments',
        icon: 'ClipboardCheck',
      },
    });
  }

  return alerts;
}

/**
 * Generate AI insights based on education data
 */
function generateAIInsights(data: EducationDashboardData): any[] {
  const insights: any[] = [];

  // At-risk intervention insight
  if (data.atRiskStudents.length > 0) {
    insights.push({
      id: 'at_risk_intervention',
      type: 'alert',
      title: 'At-Risk Alert',
      description: `${data.atRiskStudents.length} students below 60% progress threshold`,
      reasoning: 'Based on login frequency, assignment completion, and video views',
      recommendation: 'Send personalized encouragement, offer tutoring',
      impact: 'Improve completion rate by 8-12%',
      actions: [
        {
          title: 'View At-Risk List',
          href: '/dashboard/students?filter=at-risk',
        },
        {
          title: 'Create Campaign',
          href: '/dashboard/marketing/campaigns/new',
        },
      ],
    });
  }

  // Course improvement insight
  const lowCompletionCourses = data.courseAnalytics.filter(
    (c) => c.completionRate < 70
  );
  if (lowCompletionCourses.length > 0) {
    insights.push({
      id: 'course_improvement',
      type: 'opportunity',
      title: 'Course Improvement Opportunity',
      description: `${lowCompletionCourses.length} courses have low completion rates`,
      reasoning: 'Students dropping off before finishing',
      recommendation: 'Review course content, add more engagement',
      impact: 'Increase student satisfaction and retention',
      actions: [
        {
          title: 'Review Courses',
          href: '/dashboard/courses?filter=low-completion',
        },
      ],
    });
  }

  // Revenue optimization insight
  if (data.metrics.revenue.change > 15) {
    insights.push({
      id: 'revenue_growth',
      type: 'positive',
      title: 'Strong Revenue Growth',
      description: `Revenue up ${data.metrics.revenue.change.toFixed(1)}% this period`,
      reasoning: 'Increased enrollments and course sales',
      recommendation: 'Consider expanding course offerings',
      impact: 'Continue growth trajectory',
      actions: [
        {
          title: 'View Analytics',
          href: '/dashboard/analytics',
        },
      ],
    });
  }

  return insights;
}
