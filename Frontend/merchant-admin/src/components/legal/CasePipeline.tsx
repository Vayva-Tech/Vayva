"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Scale, TrendingUp } from "@phosphor-icons/react";
import type { CasePipelineMetrics } from "@/types/legal";

interface CasePipelineProps {
  data?: CasePipelineMetrics;
}

export function CasePipeline({ data }: CasePipelineProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-amber-600 shadow-lg backdrop-blur-sm bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale size={24} className="text-amber-600" />
          <h2 className="text-xl font-bold text-text-primary">Case Pipeline</h2>
        </div>
        <div className="text-sm text-text-secondary">
          Win Rate: <span className="font-bold text-green-600">{data.winRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Cases by Practice Area */}
      <div className="space-y-3 mb-4">
        {data.casesByPracticeArea.slice(0, 5).map((pa) => (
          <div key={pa.code} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#1E40AF' }}
              />
              <span className="text-sm text-text-secondary">{pa.practiceArea}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-text-primary">{pa.count} cases</span>
              <span className="text-xs text-text-secondary w-16 text-right">
                {pa.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-text-secondary">Pending Intake</div>
          <div className="text-lg font-bold text-text-primary">{data.pendingIntake}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Conflicts Pending</div>
          <div className="text-lg font-bold text-amber-600">{data.conflictsPending}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Avg Case Value</div>
          <div className="text-lg font-bold text-text-primary">₦{(data.averageCaseValue / 1000).toFixed(0)}K</div>
        </div>
      </div>
    </Card>
  );
}
