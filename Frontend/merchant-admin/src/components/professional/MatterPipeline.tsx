import React from "react";
import { Card } from "@vayva/ui";
import { Scale, Users, CurrencyDollar, ChartPie } from "@phosphor-icons/react";
import type { MatterPipelineData } from "@/types/professional";

interface MatterPipelineProps {
  data?: MatterPipelineData;
}

export function MatterPipeline({ data }: MatterPipelineProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  const totalMatters = Object.values(data.statusBreakdown).reduce((sum, count) => sum + count, 0);
  const pendingConflictsClass = data.pendingConflicts > 0 ? "text-red-600" : "text-green-600";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Scale size={20} className="text-blue-600" />
          Matter Pipeline
        </h2>
        <div className={`text-sm font-medium ${pendingConflictsClass}`}>
          {data.pendingConflicts} pending conflicts
        </div>
      </div>

      <div className="space-y-6">
        {/* Practice Area Distribution */}
        <div>
          <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
            <ChartPie size={16} className="text-purple-600" />
            Matters by Practice Area
          </h3>
          <div className="space-y-2">
            {data.byPracticeArea.slice(0, 5).map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getPracticeAreaColor(area.area) }}
                  ></div>
                  <span className="text-sm text-text-primary capitalize">{formatPracticeArea(area.area)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{area.count}</span>
                  <span className="text-xs text-text-secondary">
                    {area.percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-green-600">
                    ${(area.revenueYTD / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Status Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <div className="text-2xl font-bold text-blue-900">{data.statusBreakdown.active}</div>
              <div className="text-xs text-blue-700">Active</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-900">{data.statusBreakdown.onHold}</div>
              <div className="text-xs text-yellow-700">On Hold</div>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-100">
              <div className="text-2xl font-bold text-purple-900">{data.statusBreakdown.pendingClosure}</div>
              <div className="text-xs text-purple-700">Pending Close</div>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-100">
              <div className="text-2xl font-bold text-green-900">{data.statusBreakdown.closed}</div>
              <div className="text-xs text-green-700">Closed</div>
            </div>
          </div>
        </div>

        {/* Matter Aging */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Matter Aging Report</h3>
          <div className="space-y-2">
            {data.agingReport.map((ageGroup, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">{ageGroup.daysOpen}+ days open</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{ageGroup.count} matters</span>
                  <span className="text-text-secondary">
                    avg ${(ageGroup.averageValue / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function getPracticeAreaColor(area: string): string {
  const colors: Record<string, string> = {
    corporate_law: '#3B82F6',
    litigation: '#EF4444',
    real_estate: '#10B981',
    family_law: '#F59E0B',
    intellectual_property: '#8B5CF6',
    employment_law: '#06B6D4',
    tax_law: '#8B5CF6',
    estate_planning: '#059669',
  };
  return colors[area] || '#6B7280';
}

function formatPracticeArea(area: string): string {
  return area
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}