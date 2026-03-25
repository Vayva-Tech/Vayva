// ============================================================================
// Education Industry Dashboard Main Component
// ============================================================================
'use client';

import { Button } from "@vayva/ui";
import React from 'react';
import type { 
  UniversalDashboardProps,
  IndustrySlug 
} from '@vayva/industry-core';
import {
  useUniversalDashboard,
  UniversalMetricCard,
  UniversalSectionHeader,
  UniversalChartContainer,
} from './education-dashboard-primitives';
import { 
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  ClipboardCheck,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

import type {
  CourseProgressProps,
  StudentEngagementProps,
  AssignmentQueueProps,
  InstructorPerformanceProps,
  CertificateIssuanceProps,
  EnrollmentTrendsProps,
  AtRiskStudentsProps,
  RevenueBreakdownProps
} from './components';

import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getProgressColor
} from './components';

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export function EducationDashboard({
  industry,
  variant,
  userId,
  businessId,
  className = '',
  onConfigChange,
  onError
}: UniversalDashboardProps) {
  const {
    data: dashboardData,
    config,
    loading,
    error,
    lastUpdated,
    refresh,
    isValidating
  } = useUniversalDashboard({
    industry: industry as IndustrySlug,
    variant,
    userId,
    businessId
  });

  if (error) {
    onError?.({
      code: 'DASHBOARD_ERROR',
      message: error.message,
      retryable: true
    });
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Education Dashboard</h1>
          <p className="text-blue-600 mt-1">
            Track courses, student progress, and learning outcomes
          </p>
        </div>
        <Button
          onClick={refresh}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isValidating ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <section>
        <UniversalSectionHeader
          title="Key Performance Indicators"
          subtitle="Track your most important metrics"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <UniversalMetricCard
            title="Total Revenue"
            value="$48.2K"
            change={{ value: 18, isPositive: true }}
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Active Enrollments"
            value="1,247"
            change={{ value: 12, isPositive: true }}
            icon={<Users className="h-6 w-6 text-green-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Avg Completion Rate"
            value="73%"
            change={{ value: 5, isPositive: true }}
            icon={<Award className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Student Satisfaction"
            value="4.6/5"
            change={{ value: 8, isPositive: true }}
            icon={<UserCheck className="h-6 w-6 text-amber-600" />}
            loading={loading}
          />
        </div>
      </section>

      {/* Course Progress & Student Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CourseProgressSection
          courses={[
            {
              id: '1',
              title: 'React Fundamentals',
              instructorId: 'i1',
              category: 'Development',
              price: 0,
              maxStudents: 500,
              enrolledStudents: 342,
              status: 'published',
              progress: 78,
              students: 342,
              completionRate: 82,
              revenue: 0,
              rating: 0,
              reviewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              title: 'Advanced TypeScript',
              instructorId: 'i1',
              category: 'Development',
              price: 0,
              maxStudents: 400,
              enrolledStudents: 218,
              status: 'published',
              progress: 65,
              students: 218,
              completionRate: 71,
              revenue: 0,
              rating: 0,
              reviewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              title: 'Node.js Backend Dev',
              instructorId: 'i2',
              category: 'Development',
              price: 0,
              maxStudents: 350,
              enrolledStudents: 189,
              status: 'published',
              progress: 54,
              students: 189,
              completionRate: 65,
              revenue: 0,
              rating: 0,
              reviewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '4',
              title: 'UI/UX Design Basics',
              instructorId: 'i3',
              category: 'Design',
              price: 0,
              maxStudents: 600,
              enrolledStudents: 456,
              status: 'published',
              progress: 89,
              students: 456,
              completionRate: 91,
              revenue: 0,
              rating: 0,
              reviewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]}
          loading={loading}
        />
        
        <StudentEngagementSection
          data={{
            overallScore: 76,
            videoViews: 84,
            quizAttempts: 72,
            forumPosts: 45,
            assignmentsCompleted: 68,
            forumActivity: 45,
            loginFrequency: { daily: 42, weekly: 35, monthly: 18, rarely: 5 },
            discussionForums: {
              activeThreads: 12,
              postsToday: 8,
              avgResponseTime: 2.1,
            },
          }}
          loading={loading}
        />
      </div>

      {/* Assignment Grading Queue */}
      <AssignmentQueueSection
        assignments={[
          {
            id: '1',
            title: 'React Components Quiz',
            courseId: 'c1',
            course: 'React Fundamentals',
            type: 'quiz',
            dueDate: new Date('2026-03-15'),
            totalPoints: 100,
            submissions: 89,
            submissionsCount: 89,
            gradedCount: 66,
            pendingGrading: 23,
            status: 'published',
            createdAt: new Date(),
          },
          {
            id: '2',
            title: 'TypeScript Project',
            courseId: 'c2',
            course: 'Advanced TypeScript',
            type: 'assignment',
            dueDate: new Date('2026-03-18'),
            totalPoints: 100,
            submissions: 45,
            submissionsCount: 45,
            gradedCount: 27,
            pendingGrading: 18,
            status: 'published',
            createdAt: new Date(),
          },
          {
            id: '3',
            title: 'API Design Assignment',
            courseId: 'c3',
            course: 'Node.js Backend Dev',
            type: 'assignment',
            dueDate: new Date('2026-03-20'),
            totalPoints: 100,
            submissions: 67,
            submissionsCount: 67,
            gradedCount: 36,
            pendingGrading: 31,
            status: 'published',
            createdAt: new Date(),
          },
        ]}
        totalPending={72}
        overdue={12}
        loading={loading}
      />

      {/* Instructor Performance & Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InstructorPerformanceSection
          instructors={[
            {
              id: '1',
              name: 'Dr. Sarah Chen',
              email: 'sarah@example.com',
              courses: 4,
              coursesCount: 4,
              students: 892,
              totalStudents: 892,
              rating: 4.8,
              averageRating: 4.8,
              reviewCount: 120,
              completionRate: 87,
              totalRevenue: 45200,
              revenue: 45200,
              responseTime: 4,
              joinedAt: new Date(),
              isVerified: true,
            },
            {
              id: '2',
              name: 'Prof. James Wilson',
              email: 'james@example.com',
              courses: 3,
              coursesCount: 3,
              students: 654,
              totalStudents: 654,
              rating: 4.6,
              averageRating: 4.6,
              reviewCount: 88,
              completionRate: 82,
              totalRevenue: 32800,
              revenue: 32800,
              responseTime: 5,
              joinedAt: new Date(),
              isVerified: true,
            },
            {
              id: '3',
              name: 'Dr. Emily Rodriguez',
              email: 'emily@example.com',
              courses: 5,
              coursesCount: 5,
              students: 1023,
              totalStudents: 1023,
              rating: 4.9,
              averageRating: 4.9,
              reviewCount: 200,
              completionRate: 91,
              totalRevenue: 58400,
              revenue: 58400,
              responseTime: 3,
              joinedAt: new Date(),
              isVerified: true,
            },
          ]}
          loading={loading}
        />
        
        <CertificateIssuanceSection
          certificates={{
            issuedThisMonth: 234,
            pendingIssuance: 45,
            total: 1847,
            totalCertificates: 1847,
            recentCertificates: [
              { id: '1', studentName: 'Alex Johnson', course: 'React Fundamentals', issuedAt: '2026-03-10' },
              { id: '2', studentName: 'Maria Garcia', course: 'UI/UX Design Basics', issuedAt: '2026-03-09' },
              { id: '3', studentName: 'David Kim', course: 'Advanced TypeScript', issuedAt: '2026-03-08' }
            ]
          }}
          loading={loading}
        />
      </div>

      {/* Enrollment Trends & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnrollmentTrendsSection 
          data={{
            monthlyEnrollments: [145, 178, 203, 256, 312],
            activeStudents: 1247,
            newStudentsThisMonth: 312,
            returningStudents: 935,
            churnRate: 8
          }}
          loading={loading}
        />
        
        <AtRiskStudentsSection
          students={[
            {
              id: '1',
              name: 'John Doe',
              email: '',
              enrollmentCount: 3,
              completedCourses: 0,
              inProgressCourses: 3,
              overallProgress: 32,
              progress: 32,
              totalLearningTime: 0,
              lastActiveAt: new Date('2026-03-01'),
              lastActive: new Date('2026-03-01'),
              enrolledAt: new Date(),
              certificatesEarned: 0,
              atRisk: true,
              courses: 3,
              riskLevel: 'high',
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: '',
              enrollmentCount: 2,
              completedCourses: 0,
              inProgressCourses: 2,
              overallProgress: 45,
              progress: 45,
              totalLearningTime: 0,
              lastActiveAt: new Date('2026-03-05'),
              lastActive: new Date('2026-03-05'),
              enrolledAt: new Date(),
              certificatesEarned: 0,
              atRisk: true,
              courses: 2,
              riskLevel: 'medium',
            },
            {
              id: '3',
              name: 'Bob Wilson',
              email: '',
              enrollmentCount: 4,
              completedCourses: 0,
              inProgressCourses: 4,
              overallProgress: 28,
              progress: 28,
              totalLearningTime: 0,
              lastActiveAt: new Date('2026-02-28'),
              lastActive: new Date('2026-02-28'),
              enrolledAt: new Date(),
              certificatesEarned: 0,
              atRisk: true,
              courses: 4,
              riskLevel: 'high',
            },
            {
              id: '4',
              name: 'Alice Brown',
              email: '',
              enrollmentCount: 2,
              completedCourses: 0,
              inProgressCourses: 2,
              overallProgress: 52,
              progress: 52,
              totalLearningTime: 0,
              lastActiveAt: new Date('2026-03-08'),
              lastActive: new Date('2026-03-08'),
              enrolledAt: new Date(),
              certificatesEarned: 0,
              atRisk: true,
              courses: 2,
              riskLevel: 'medium',
            },
          ]}
          totalAtRisk={47}
          loading={loading}
        />
      </div>

      {/* Revenue Breakdown */}
      <RevenueBreakdownSection 
        data={{
          byCategory: {
            'Development': 125000,
            'Design': 78000,
            'Business': 45000,
            'Marketing': 32000
          },
          totalRevenue: 280000,
          projectedRevenue: 350000,
          growthRate: 23
        }}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Components
// ---------------------------------------------------------------------------

function CourseProgressSection({ courses, loading }: CourseProgressProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Course Progress Overview"
        subtitle="Active courses and completion rates"
        icon={<BookOpen className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">
                  {course.name ?? course.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {(course.students ?? course.enrolledStudents).toLocaleString()}{' '}
                  students
                </p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(course.completionRate ?? course.progress)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                style={{
                  width: `${course.progress}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentEngagementSection({ data, loading }: StudentEngagementProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Student Engagement"
        subtitle="Learning activity and participation"
        icon={<BarChart3 className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">Overall Score</p>
            <p className="text-2xl font-bold text-blue-900">
              {data.overallScore}/100
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700">Video Views</p>
            <p className="text-2xl font-bold text-purple-900">
              {formatPercentage(data.videoViews)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">Quiz Attempts</p>
            <p className="text-2xl font-bold text-green-900">
              {formatPercentage(data.quizAttempts)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-700">Assignments</p>
            <p className="text-2xl font-bold text-amber-900">
              {formatPercentage(data.assignmentsCompleted)}
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Login Frequency</h4>
          <div className="space-y-2">
            {Object.entries(data.loginFrequency).map(([frequency, count]) => (
              <div key={frequency} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{frequency}</span>
                    <span>{count}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${count}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AssignmentQueueSection({ assignments, totalPending, overdue, loading }: AssignmentQueueProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Assignment Grading Queue"
        subtitle="Submissions awaiting review"
        icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-700">Pending Grading</p>
            <p className="text-2xl font-bold text-amber-900">{totalPending}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-sm text-red-700">Overdue</p>
            <p className="text-2xl font-bold text-red-900">{overdue}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Submissions</h4>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-500">
                    {assignment.course ?? assignment.courseTitle ?? assignment.courseId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {assignment.pendingGrading}/
                    {assignment.submissions ?? assignment.submissionsCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due:{' '}
                    {assignment.dueDate instanceof Date
                      ? assignment.dueDate.toLocaleDateString()
                      : String(assignment.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InstructorPerformanceSection({ instructors, loading }: InstructorPerformanceProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Instructor Performance"
        subtitle="Top-performing educators"
        icon={<Target className="h-5 w-5 text-purple-600" />}
      />
      
      <div className="mt-6 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instructors.map((instructor) => (
              <tr key={instructor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900">{instructor.name}</p>
                  <p className="text-gray-500">
                    {instructor.courses ?? instructor.coursesCount} courses •{' '}
                    {(instructor.students ?? instructor.totalStudents).toLocaleString()}{' '}
                    students
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ⭐ {instructor.rating ?? instructor.averageRating}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatPercentage(instructor.completionRate)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(instructor.revenue ?? instructor.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CertificateIssuanceSection({ certificates, loading }: CertificateIssuanceProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Certificate Issuance"
        subtitle="Credentials awarded to students"
        icon={<Award className="h-5 w-5 text-amber-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">{certificates.issuedThisMonth}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{certificates.pendingIssuance}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {(
                certificates.totalCertificates ??
                certificates.total ??
                0
              ).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Certificates</h4>
          <div className="space-y-2">
            {certificates.recentCertificates.map((cert) => (
              <div key={cert.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cert.studentName}</p>
                  <p className="text-sm text-gray-500">{cert.course}</p>
                </div>
                <span className="text-xs text-gray-500">{cert.issuedAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EnrollmentTrendsSection({ data, loading }: EnrollmentTrendsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Enrollment Trends"
        subtitle="Student enrollment over time"
        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Monthly Enrollments</h3>
            <span className="text-sm text-gray-500">Last 5 months</span>
          </div>
          <div className="h-32 flex items-end space-x-2">
            {data.monthlyEnrollments.map((count, index) => (
              <div 
                key={index}
                className="flex-1 bg-green-200 rounded-t hover:bg-green-300 transition-colors"
                style={{ height: `${(count / Math.max(...data.monthlyEnrollments)) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">Active Students</p>
            <p className="text-xl font-bold text-green-900">{data.activeStudents.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">New This Month</p>
            <p className="text-xl font-bold text-blue-900">{data.newStudentsThisMonth}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700">Churn Rate</p>
            <p className="text-xl font-bold text-purple-900">{formatPercentage(data.churnRate)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtRiskStudentsSection({ students, totalAtRisk, loading }: AtRiskStudentsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="At-Risk Students"
        subtitle="Students needing intervention"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-red-700">Total At-Risk Students</p>
          <p className="text-3xl font-bold text-red-900">{totalAtRisk}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">High Priority</h4>
          <div className="space-y-2">
            {students.filter(s => s.riskLevel === 'high').map((student) => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-red-900">{student.name}</p>
                  <p className="text-sm text-red-700">
                    {student.progress}% progress • Last active:{' '}
                    {String(
                      student.lastActive ??
                        student.lastActiveAt ??
                        ''
                    )}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-800">
                  High Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueBreakdownSection({ data, loading }: RevenueBreakdownProps) {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
      <UniversalSectionHeader
        title="Revenue Breakdown"
        subtitle="By course category"
        icon={<PieChart className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.byCategory).map(([category, amount]) => (
            <div key={category} className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">{category}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(amount)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(data.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Projected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(data.projectedRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              +{data.growthRate}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
