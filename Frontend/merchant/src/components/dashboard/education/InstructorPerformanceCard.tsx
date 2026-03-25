'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, DollarSign, TrendingUp } from 'lucide-react';
import { UniversalSectionHeader } from './universal';

interface Instructor {
  id: string;
  name: string;
  coursesCount: number;
  totalStudents: number;
  averageRating: number;
  reviewCount: number;
  completionRate: number;
  totalRevenue: number;
}

interface InstructorPerformanceCardProps {
  instructors: Instructor[];
  designCategory?: string;
}

export function InstructorPerformanceCard({ instructors, designCategory }: InstructorPerformanceCardProps) {
  const avgRating = instructors.length > 0
    ? instructors.reduce((sum, i) => sum + i.averageRating, 0) / instructors.length
    : 0;

  const topInstructor = instructors[0];

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Instructor Performance"
        subtitle={`${instructors.length} instructors`}
        icon={<Star className="h-5 w-5" />}
      />

      {/* Top Performer */}
      {topInstructor && (
        <Card className="border-green-500/50 bg-gradient-to-br from-card to-card/80 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Top Performer</p>
                <h3 className="text-xl font-bold text-gray-900">{topInstructor.name}</h3>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/10">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-gray-900">{topInstructor.averageRating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-xl bg-gray-100/50">
                <p className="text-xs text-gray-500 mb-1">Courses</p>
                <p className="text-lg font-bold text-gray-900">{topInstructor.coursesCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-gray-100/50">
                <p className="text-xs text-gray-500 mb-1">Students</p>
                <p className="text-lg font-bold text-gray-900">{topInstructor.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg Rating</p>
                <p className="text-xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              </div>
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-green-500">
                  ${instructors.reduce((sum, i) => sum + i.totalRevenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructors List */}
      <div className="space-y-2">
        {instructors.slice(0, 5).map((instructor) => (
          <Card key={instructor.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{instructor.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {instructor.totalStudents.toLocaleString()} students
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {instructor.completionRate}% complete
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-gray-900 text-sm">{instructor.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${instructor.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
