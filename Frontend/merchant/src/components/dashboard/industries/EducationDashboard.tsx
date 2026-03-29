/**
 * Education Dashboard - Bookings & Events Archetype
 * 
 * For: Schools, Online Courses, Tutoring Centers, Training Programs
 * 
 * Features:
 * - Student enrollment tracking
 * - Course progress monitoring
 * - Assignment/quiz management (PRO)
 * - Attendance tracking
 * - Parent portal access (PRO+)
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { TasksModule } from './modules/TasksModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { BookOpen, Users, TrendingUp, Calendar, Award, FileText } from 'lucide-react';

export function EducationDashboard() {
  const { isVisible: showLMS, isHiddenByPlan: lmsLocked } = useModuleVisibility(
    'lms',
    { industry: 'education', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const enrollmentData = [
    { month: 'Jan', students: 245 },
    { month: 'Feb', students: 268 },
    { month: 'Mar', students: 312 },
    { month: 'Apr', students: 298 },
    { month: 'May', students: 356 },
    { month: 'Jun', students: 423 },
  ];

  const courseDistribution = [
    { label: 'Mathematics', value: 30, color: '#3b82f6' },
    { label: 'Science', value: 25, color: '#10b981' },
    { label: 'Languages', value: 20, color: '#f59e0b' },
    { label: 'Arts', value: 15, color: '#ef4444' },
    { label: 'Sports', value: 10, color: '#8b5cf6' },
  ];

  return (
    <UnifiedDashboard industry="education" planTier="PRO" designCategory="bookings">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Students"
          value="423"
          change={18}
          trend="up"
          icon={<Users size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Active Courses"
          value="24"
          change={4}
          trend="up"
          icon={<BookOpen size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Avg Attendance"
          value="87%"
          change={5}
          trend="up"
          icon={<Calendar size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Completion Rate"
          value="92%"
          change={2}
          trend="up"
          icon={<Award size={16} className="text-orange-600" />}
        />
      </div>

      {/* LMS Section */}
      <FeatureGate minPlan="PRO">
        {showLMS && (
          <div className="mb-6">
            <LMSSection />
          </div>
        )}
        {lmsLocked && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📚 Unlock Learning Management System
            </h3>
            <p className="text-gray-600 mb-4">
              Get course content hosting, student progress tracking, and automated assessments with PRO plan
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade to PRO →
            </a>
          </div>
        )}
      </FeatureGate>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enrollment Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Enrollment Trends
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {enrollmentData.map(month => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(month.students / 450) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Courses by Department</h3>
          <DonutChart data={courseDistribution} size={200} />
          <div className="mt-4 space-y-2">
            {courseDistribution.map(course => (
              <div key={course.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="text-gray-700">{course.label}</span>
                </div>
                <span className="font-medium text-gray-900">{course.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Recent Assessments
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Create Assessment
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assessment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submissions</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { course: 'Mathematics 101', assessment: 'Algebra Quiz', dueDate: 'Mar 30', submissions: '28/32', avgScore: '85%' },
                { course: 'Physics', assessment: 'Lab Report', dueDate: 'Apr 2', submissions: '15/30', avgScore: '78%' },
                { course: 'English Literature', assessment: 'Essay', dueDate: 'Apr 5', submissions: '22/28', avgScore: '82%' },
                { course: 'Chemistry', assessment: 'Midterm Exam', dueDate: 'Apr 10', submissions: '0/35', avgScore: '-' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.course}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.assessment}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.dueDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.submissions}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{item.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AttendanceCard
            level="Primary School"
            present={145}
            absent={8}
            total={153}
          />
          <AttendanceCard
            level="Secondary School"
            present={198}
            absent={12}
            total={210}
          />
          <AttendanceCard
            level="Sixth Form"
            present={56}
            absent={4}
            total={60}
          />
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Upcoming Events
          </h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            View Calendar
          </button>
        </div>
        
        <div className="space-y-3">
          <EventRow
            event="Parent-Teacher Conference"
            date="April 15, 2026"
            time="9:00 AM - 3:00 PM"
            type="school-wide"
          />
          <EventRow
            event="Science Fair"
            date="April 22, 2026"
            time="10:00 AM - 2:00 PM"
            type="competition"
          />
          <EventRow
            event="Sports Day"
            date="May 5, 2026"
            time="8:00 AM - 4:00 PM"
            type="athletics"
          />
          <EventRow
            event="Final Exams Begin"
            date="May 20, 2026"
            time="All Day"
            type="academic"
          />
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function LMSSection() {
  const courses = [
    { name: 'Mathematics 101', students: 32, progress: 75, nextLesson: 'Quadratic Equations' },
    { name: 'Physics Advanced', students: 28, progress: 60, nextLesson: 'Quantum Mechanics Intro' },
    { name: 'English Literature', students: 35, progress: 85, nextLesson: 'Shakespeare Analysis' },
    { name: 'Chemistry Lab', students: 30, progress: 45, nextLesson: 'Organic Compounds' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Courses</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Create Course
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{course.name}</h4>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                {course.students} students
              </span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-600">
              Next: <span className="font-medium text-gray-900">{course.nextLesson}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AttendanceCardProps {
  level: string;
  present: number;
  absent: number;
  total: number;
}

function AttendanceCard({ level, present, absent, total }: AttendanceCardProps) {
  const percentage = Math.round((present / total) * 100);
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      <h4 className="font-semibold text-gray-900 mb-2">{level}</h4>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-2xl font-bold text-green-700">{present}</p>
          <p className="text-xs text-gray-600">Present</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-xs text-gray-600">Absent</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600">Rate</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface EventRowProps {
  event: string;
  date: string;
  time: string;
  type: string;
}

function EventRow({ event, date, time, type }: EventRowProps) {
  const typeColors: Record<string, string> = {
    'school-wide': 'bg-blue-100 text-blue-800',
    'competition': 'bg-purple-100 text-purple-800',
    'athletics': 'bg-orange-100 text-orange-800',
    'academic': 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{event}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
          <span>{date}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('-', ' ').toUpperCase()}
      </span>
    </div>
  );
}
