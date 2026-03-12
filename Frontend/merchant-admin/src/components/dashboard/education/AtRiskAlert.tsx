'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UniversalSectionHeader } from './universal';

interface AtRiskStudent {
  studentId: string;
  studentName: string;
  atRiskReasons: string[];
  overallProgress: number;
  lastActiveDate?: string;
}

interface AtRiskAlertProps {
  students: AtRiskStudent[];
  designCategory?: string;
}

export function AtRiskAlert({ students, designCategory }: AtRiskAlertProps) {
  if (students.length === 0) {
    return null;
  }

  const getSeverity = (reasons: string[]) => {
    if (reasons.includes('Below 50% progress')) return 'critical';
    if (reasons.includes('Inactive >14 days')) return 'high';
    return 'medium';
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <TrendingDown className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-950/20';
      case 'high':
        return 'border-orange-500 bg-orange-950/20';
      default:
        return 'border-yellow-500 bg-yellow-950/20';
    }
  };

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="At-Risk Students"
        subtitle={`${students.length} students need intervention`}
        icon={<AlertTriangle className="h-5 w-5" />}
      />

      {/* Summary */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-950/30 to-card rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Immediate Attention Required</p>
              <p className="text-3xl font-bold text-red-400">{students.length} students</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <div className="space-y-2">
        {students.slice(0, 5).map((student) => {
          const severity = getSeverity(student.atRiskReasons);
          
          return (
            <Card key={student.studentId} className={`border-l-4 hover:border-primary/50 transition-all rounded-2xl ${getColor(severity)}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon(severity)}
                      <div>
                        <h4 className="font-semibold text-lg text-foreground">{student.studentName}</h4>
                        <p className="text-xs text-muted-foreground">
                          Progress: {student.overallProgress}%
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Intervene
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {student.atRiskReasons.map((reason, idx) => (
                      <p key={idx} className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {reason}
                      </p>
                    ))}
                  </div>

                  {student.lastActiveDate && (
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(student.lastActiveDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
