'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { UniversalSectionHeader } from './universal';

interface Course {
  id: string;
  title: string;
  instructorName?: string;
  enrolledStudents: number;
  maxStudents: number;
  progress: number;
  revenue: number;
  status: 'draft' | 'published' | 'archived';
  rating?: number;
}

interface ActiveCoursesSectionProps {
  courses: Course[];
  designCategory?: string;
}

export function ActiveCoursesSection({ courses, designCategory }: ActiveCoursesSectionProps) {
  const publishedCourses = courses.filter(c => c.status === 'published');
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolledStudents, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.revenue || 0), 0);

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Active Courses"
        subtitle={`${publishedCourses.length} published courses`}
        icon={<BookOpen className="h-5 w-5" />}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{totalEnrolled}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.length > 0 
                    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {courses.slice(0, 6).map((course) => (
          <Card key={course.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{course.title}</h4>
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="rounded-full px-2 py-0.5 text-xs">
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Instructor: {course.instructorName || 'Not assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">${course.revenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {course.enrolledStudents}/{course.maxStudents} students
                    </span>
                    <span className="font-medium text-gray-900">{course.progress}% complete</span>
                  </div>
                  <Progress value={course.progress} className="h-2 rounded-full" style={{
                    background: 'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.6) 100%)'
                  }} />
                </div>

                {course.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-500">rating</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
