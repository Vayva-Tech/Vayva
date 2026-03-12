/**
 * Education Industry Service
 * 
 * Provides education-specific dashboard data fetching and business logic
 */

import type { 
  EducationDashboardData,
  Course,
  Student,
  Instructor,
  Assignment,
  AssignmentSubmission,
  Certificate,
  EngagementMetrics,
  StudentProgress,
  CourseAnalytics,
  EducationAlert,
  EducationSuggestedAction
} from '../types';

// ---------------------------------------------------------------------------
// Service Configuration
// ---------------------------------------------------------------------------

const API_BASE = '/api/education';

// ---------------------------------------------------------------------------
// Education Dashboard Service
// ---------------------------------------------------------------------------

export class EducationDashboardService {
  private storeId: string;
  
  constructor(storeId: string) {
    this.storeId = storeId;
  }
  
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(
    range: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month',
    includeDetails = true
  ): Promise<EducationDashboardData> {
    const response = await fetch(`${API_BASE}/dashboard?storeId=${this.storeId}&range=${range}&includeDetails=${includeDetails}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch education dashboard data: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as EducationDashboardData;
  }
  
  /**
   * Get course statistics
   */
  async getCourseStats(courseId?: string): Promise<{
    totalCourses: number;
    activeCourses: number;
    byCategory: Record<string, number>;
    topCourses: Course[];
    lowPerformingCourses: Course[];
  }> {
    const params = new URLSearchParams({ storeId: this.storeId });
    if (courseId) params.append('courseId', courseId);
    
    const response = await fetch(`${API_BASE}/courses/stats?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course stats: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get student progress data
   */
  async getStudentProgress(studentId?: string, atRiskOnly = false): Promise<{
    overallProgress: number;
    totalStudents: number;
    activeStudents: number;
    atRiskCount: number;
    studentProgress: StudentProgress[];
  }> {
    const params = new URLSearchParams({ 
      storeId: this.storeId,
      atRiskOnly: atRiskOnly.toString()
    });
    if (studentId) params.append('studentId', studentId);
    
    const response = await fetch(`${API_BASE}/students/progress?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student progress: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get instructor performance metrics
   */
  async getInstructorPerformance(instructorId?: string): Promise<{
    totalInstructors: number;
    averageRating: number;
    averageCompletionRate: number;
    topPerformers: Instructor[];
    needsSupport: Instructor[];
  }> {
    const params = new URLSearchParams({ storeId: this.storeId });
    if (instructorId) params.append('instructorId', instructorId);
    
    const response = await fetch(`${API_BASE}/instructors/performance?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch instructor performance: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get assignments data
   */
  async getAssignments(courseId?: string, pendingGrading = false): Promise<{
    totalAssignments: number;
    pendingGrading: number;
    overdueSubmissions: number;
    assignments: Assignment[];
    recentSubmissions: AssignmentSubmission[];
    gradingQueue: AssignmentSubmission[];
  }> {
    const params = new URLSearchParams({ storeId: this.storeId });
    if (courseId) params.append('courseId', courseId);
    if (pendingGrading) params.append('pendingGrading', 'true');
    
    const response = await fetch(`${API_BASE}/assignments?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assignments: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate certificate for student
   */
  async generateCertificate(
    studentId: string,
    courseId: string,
    templateId?: string
  ): Promise<{
    certificate: Certificate;
    downloadUrl: string;
    verificationUrl: string;
  }> {
    const response = await fetch(`${API_BASE}/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId: this.storeId,
        studentId,
        courseId,
        templateId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate certificate: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get completion analytics
   */
  async getCompletionAnalytics(courseId?: string): Promise<{
    overallCompletionRate: number;
    completionsThisPeriod: number;
    previousPeriodChange: number;
    courseAnalytics: CourseAnalytics[];
  }> {
    const params = new URLSearchParams({ storeId: this.storeId });
    if (courseId) params.append('courseId', courseId);
    
    const response = await fetch(`${API_BASE}/analytics/completion?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch completion analytics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get engagement analytics
   */
  async getEngagementAnalytics(): Promise<{
    overallEngagementScore: number;
    activeLearners: number;
    averageSessionDuration: number;
    loginsThisPeriod: number;
    videoViews: number;
    quizAttempts: number;
    forumActivity: number;
    assignmentSubmissions: number;
  }> {
    const response = await fetch(`${API_BASE}/analytics/engagement?storeId=${this.storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch engagement analytics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate alerts based on education data
   */
  generateAlerts(data: EducationDashboardData): EducationAlert[] {
    const alerts: EducationAlert[] = [];
    
    // At-risk students alert
    if (data.students.atRiskCount > 5) {
      alerts.push({
        id: 'at_risk_students',
        type: 'critical',
        category: 'student',
        title: 'High At-Risk Student Count',
        message: `${data.students.atRiskCount} students are at risk of failing`,
        affectedEntity: {
          type: 'student',
          id: 'multiple',
          name: `${data.students.atRiskCount} students`,
        },
        suggestedAction: {
          title: 'View At-Risk List',
          href: '/dashboard/students?filter=at-risk',
          icon: 'UserX',
        },
        createdAt: new Date(),
      });
    }
    
    // Low completion rate alert
    const avgCompletion = data.courses.topPerformers.reduce((acc, c) => acc + c.completionRate, 0) / data.courses.topPerformers.length;
    if (avgCompletion < 60) {
      alerts.push({
        id: 'low_completion',
        type: 'warning',
        category: 'course',
        title: 'Low Completion Rate',
        message: `Average completion rate is ${avgCompletion.toFixed(1)}%`,
        suggestedAction: {
          title: 'Review Courses',
          href: '/dashboard/courses',
          icon: 'BookOpen',
        },
        createdAt: new Date(),
      });
    }
    
    // Pending grading alert
    if (data.assignments.totalPending > 20) {
      alerts.push({
        id: 'pending_grading',
        type: 'warning',
        category: 'assignment',
        title: 'Large Grading Queue',
        message: `${data.assignments.totalPending} assignments awaiting grading`,
        suggestedAction: {
          title: 'Start Grading',
          href: '/dashboard/assignments',
          icon: 'ClipboardCheck',
        },
        createdAt: new Date(),
      });
    }
    
    return alerts;
  }
  
  /**
   * Generate suggested actions based on education data
   */
  generateSuggestedActions(data: EducationDashboardData): EducationSuggestedAction[] {
    const actions: EducationSuggestedAction[] = [];
    
    // Intervention for at-risk students
    if (data.students.atRiskCount > 0) {
      actions.push({
        id: 'intervene_at_risk',
        title: 'Intervene with at-risk students',
        reason: 'Students below 60% progress threshold',
        severity: 'critical',
        href: '/dashboard/students?filter=at-risk',
        icon: 'UserX',
        estimatedImpact: 'Improve completion rate by 8-12%',
      });
    }
    
    // Review low-completion courses
    const lowCompletionCourses = data.courses.topPerformers.filter(c => c.completionRate < 70);
    if (lowCompletionCourses.length > 0) {
      actions.push({
        id: 'review_courses',
        title: 'Review low-completion courses',
        reason: 'Students dropping off before finishing',
        severity: 'warning',
        href: '/dashboard/courses?filter=low-completion',
        icon: 'BookOpen',
        estimatedImpact: 'Increase student satisfaction and retention',
      });
    }
    
    // Grade pending assignments
    if (data.assignments.totalPending > 10) {
      actions.push({
        id: 'grade_assignments',
        title: 'Grade pending assignments',
        reason: 'Submissions awaiting review',
        severity: 'info',
        href: '/dashboard/assignments',
        icon: 'ClipboardCheck',
        estimatedImpact: 'Improve student feedback loop',
      });
    }
    
    return actions;
  }
}
