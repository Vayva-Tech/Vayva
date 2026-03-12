"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Timer, Warning } from "@phosphor-icons/react";
import type { DeadlineMetrics } from "@/types/legal";

interface CriticalDeadlinesProps {
  data?: DeadlineMetrics;
}

export function CriticalDeadlines({ data }: CriticalDeadlinesProps) {
  if (!data) return null;

  const todaysDeadlines = data.todaysDeadlines || [];
  const upcomingDeadlines = data.upcomingDeadlines || [];

  return (
    <Card className="p-6 border-l-4 border-red-700 shadow-lg backdrop-blur-sm bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <Timer size={24} className="text-red-700" />
        <h2 className="text-xl font-bold text-text-primary">Critical Deadlines</h2>
      </div>

      {/* Today's Deadlines */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">Due Today</h3>
        {todaysDeadlines.length === 0 ? (
          <p className="text-sm text-text-secondary italic">No deadlines due today</p>
        ) : (
          <div className="space-y-2">
            {todaysDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={`p-3 rounded-lg border ${
                  deadline.priority === 'critical' || deadline.priority === 'urgent'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="text-sm font-medium text-text-primary">{deadline.title}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {deadline.case.caseNumber} • {deadline.responsibleAttorneyName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statute of Limitations Alerts */}
      {data.statuteOfLimitationsAlerts && data.statuteOfLimitationsAlerts.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Warning size={16} className="text-red-600" />
            <h3 className="text-sm font-semibold text-text-secondary">Statute of Limitations</h3>
          </div>
          {data.statuteOfLimitationsAlerts.slice(0, 3).map((alert, idx) => (
            <div key={idx} className="py-1 flex items-center justify-between text-sm">
              <span className="text-text-primary">{alert.caseNumber}</span>
              <span className={`font-medium ${alert.daysRemaining <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                {alert.daysRemaining} days
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
