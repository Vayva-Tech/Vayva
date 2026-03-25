'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { UniversalSectionHeader } from './universal';

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentName: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  daysLate?: number;
}

interface Assignment {
  id: string;
  title: string;
  courseTitle?: string;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  dueDate: string;
  submissionsCount: number;
  gradedCount: number;
  pendingGrading: number;
  status: 'draft' | 'published' | 'closed';
}

interface AssignmentGradingQueueProps {
  assignments: Assignment[];
  pendingSubmissions: AssignmentSubmission[];
  designCategory?: string;
}

export function AssignmentGradingQueue({ 
  assignments, 
  pendingSubmissions,
  designCategory 
}: AssignmentGradingQueueProps) {
  const totalPending = assignments.reduce((sum, a) => sum + a.pendingGrading, 0);
  const overdueCount = assignments.filter(a => new Date(a.dueDate) < new Date()).length;

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Assignments & Grading"
        subtitle={`${totalPending} submissions to grade`}
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Grading</p>
                <p className="text-3xl font-bold text-orange-500">{totalPending}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <ClipboardList className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Overdue</p>
                <p className="text-3xl font-bold text-red-500">{overdueCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Graded</p>
                <p className="text-3xl font-bold text-green-500">
                  {assignments.reduce((sum, a) => sum + a.gradedCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions Queue */}
      {pendingSubmissions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-500">Recent Submissions</h3>
          {pendingSubmissions.slice(0, 5).map((submission) => (
            <Card key={submission.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      submission.status === 'late' ? 'bg-red-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Clock className={`h-4 w-4 ${
                        submission.status === 'late' ? 'text-red-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{submission.studentName}</p>
                      <p className="text-xs text-gray-500">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        {submission.daysLate && (
                          <span className="text-red-400 ml-1">
                            ({submission.daysLate} days late)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full">
                    Grade
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-gray-500">Active Assignments</h3>
        {assignments.slice(0, 5).map((assignment) => (
          <Card key={assignment.id} className="bg-white border-gray-100 hover:border-green-500/50 transition-all rounded-2xl">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <Badge variant="outline" className="text-xs rounded-full">
                        {assignment.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{assignment.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {assignment.gradedCount}/{assignment.submissionsCount}
                    </p>
                    <p className="text-xs text-gray-500">graded</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={new Date(assignment.dueDate) < new Date() ? 'text-red-400' : ''}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    {assignment.pendingGrading > 0 && (
                      <Badge variant="secondary" className="text-xs rounded-full">
                        {assignment.pendingGrading} pending
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full">
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
