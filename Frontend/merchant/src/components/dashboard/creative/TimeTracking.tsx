'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeTrackingProps {
  billedHours?: number;
  nonBillableHours?: number;
  missingHours?: number;
  topTracker?: { name: string; hours: number };
  avgHourlyRate?: number;
  unsubmittedCount?: number;
  approvalPendingCount?: number;
  className?: string;
}

/**
 * TimeTracking - Displays weekly time tracking summary
 */
export const TimeTracking: React.FC<TimeTrackingProps> = ({
  billedHours = 147,
  nonBillableHours = 23,
  missingHours = 12,
  topTracker = { name: 'Mike R.', hours: 42 },
  avgHourlyRate = 127,
  unsubmittedCount = 3,
  approvalPendingCount = 8,
  className,
}) => {
  const totalHours = billedHours + nonBillableHours;
  const billablePercentage = Math.round((billedHours / totalHours) * 100);

  return (
    <Card className={cn("relative overflow-hidden bg-white/90  border-white/20 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Time Tracking</h3>
          </div>
          <Badge variant={missingHours > 0 ? "destructive" : "secondary"}>
            This Week
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hours Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 p-3 rounded-lg bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">Billed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{billedHours}h</p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-blue-500/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">Non-Billable</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{nonBillableHours}h</p>
          </div>
        </div>

        {/* Missing Hours Alert */}
        {missingHours > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-orange-500/10 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Missing Time Entries</p>
              <p className="text-xs">{missingHours} hours not accounted for</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              Remind Team
            </Button>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Top Tracker</span>
            </div>
            <p className="text-sm font-semibold">{topTracker.name}</p>
            <p className="text-xs text-gray-500">{topTracker.hours}h this week</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Avg Hourly</span>
            </div>
            <p className="text-sm font-semibold">${avgHourlyRate}</p>
            <p className="text-xs text-gray-500">Revenue/hour</p>
          </div>
        </div>

        {/* Administrative Items */}
        {(unsubmittedCount > 0 || approvalPendingCount > 0) && (
          <div className="space-y-2 pt-3 mt-3 border-t">
            {unsubmittedCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Unsubmitted Timesheets</span>
                <Badge variant="destructive">{unsubmittedCount}</Badge>
              </div>
            )}
            {approvalPendingCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Approval Pending</span>
                <Badge variant="secondary">{approvalPendingCount}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Billable Rate Progress */}
        <div className="space-y-2 pt-3 mt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Billable Rate</span>
            <span className="font-semibold">{billablePercentage}%</span>
          </div>
          <Progress value={billablePercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            Target: 75% billable utilization
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Add Progress component import
import { Progress } from '@/components/ui/progress';

export default TimeTracking;
