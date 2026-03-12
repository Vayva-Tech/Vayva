"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { ListChecks } from "@phosphor-icons/react";
import type { TaskManagementMetrics } from "@/types/legal";

interface TaskManagementProps {
  data?: TaskManagementMetrics;
}

export function TaskManagement({ data }: TaskManagementProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-teal-700 shadow-lg backdrop-blur-sm bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks size={24} className="text-teal-700" />
        <h2 className="text-xl font-bold text-text-primary">Task Management</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-700">{data.overdue}</div>
          <div className="text-xs text-red-700">Overdue</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-700">{data.dueToday}</div>
          <div className="text-xs text-amber-700">Due Today</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{data.highPriority}</div>
          <div className="text-xs text-blue-700">High Priority</div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Attorneys</span>
          <span className="font-medium text-text-primary">{data.byRole.attorneys}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Paralegals</span>
          <span className="font-medium text-text-primary">{data.byRole.paralegals}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Staff</span>
          <span className="font-medium text-text-primary">{data.byRole.staff}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-text-secondary">Completion Rate</span>
          <span className="font-bold text-green-600">{data.completionRate.toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
}
