'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { UniversalSectionHeader } from './universal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudentProgress {
  studentId: string;
  studentName: string;
  overallProgress: number;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    status: 'active' | 'completed' | 'at-risk';
    lastActivity: string;
  }>;
  atRiskReasons?: string[];
}

interface StudentProgressPanelProps {
  students: StudentProgress[];
  designCategory?: string;
}

export function StudentProgressPanel({ students, designCategory }: StudentProgressPanelProps) {
  const atRiskStudents = students.filter(s => s.atRiskReasons);
  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length)
    : 0;

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Student Progress"
        subtitle={`${students.length} students tracked`}
        icon={<Users className="h-5 w-5" />}
      />

      {/* At-Risk Alert */}
      {atRiskStudents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{atRiskStudents.length} at-risk students</strong> need attention
            <span className="text-sm text-muted-foreground ml-2">
              (below 60% progress or inactive)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Progress</p>
                <p className="text-3xl font-bold text-foreground">{avgProgress}%</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Track</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {students.length - atRiskStudents.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">At Risk</p>
                <p className="text-3xl font-bold text-red-500">{atRiskStudents.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {students.slice(0, 8).map((student) => (
          <Card key={student.studentId} className={`border-border/50 hover:border-primary/50 transition-all rounded-2xl ${student.atRiskReasons ? 'border-red-500/50 bg-red-950/20' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{student.studentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {student.courses.length} courses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{student.overallProgress}%</p>
                    <p className="text-xs text-muted-foreground">overall</p>
                  </div>
                </div>

                <Progress value={student.overallProgress} className="h-2 rounded-full" style={{
                  background: student.atRiskReasons 
                    ? 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.6) 100%)'
                    : 'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.6) 100%)'
                }} />

                {student.atRiskReasons && (
                  <div className="space-y-1">
                    {student.atRiskReasons.map((reason, idx) => (
                      <p key={idx} className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {reason}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {student.courses.slice(0, 3).map((course) => (
                    <div key={course.courseId} className="text-xs px-3 py-1.5 rounded-full bg-secondary/50">
                      <span className="font-medium text-foreground">{course.courseTitle}</span>
                      <span className="text-muted-foreground ml-1">
                        {course.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
