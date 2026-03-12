"use client";

import React from "react";

interface LeadPipelineProps {
  initialData?: Record<string, number>;
}

export const LeadPipeline: React.FC<LeadPipelineProps> = ({ initialData }) => {
  const stages = [
    { id: 'new', name: 'New Leads', icon: '🔵', color: '#60A5FA' },
    { id: 'contacted', name: 'Contacted', icon: '🟡', color: '#F59E0B' },
    { id: 'qualified', name: 'Qualified', icon: '🟠', color: '#FB923C' },
    { id: 'showing_scheduled', name: 'Showing Scheduled', icon: '🟣', color: '#A78BFA' },
    { id: 'offer_made', name: 'Offer Made', icon: '🔴', color: '#EF4444' },
    { id: 'under_contract', name: 'Under Contract', icon: '🟤', color: '#A8A29E' },
    { id: 'converted', name: 'Closed', icon: '⚫', color: '#10B981' }
  ];

  const totalLeads = Object.values(initialData || {}).reduce((sum, count) => sum + count, 0);

  const getStageCount = (stageId: string) => {
    return initialData?.[stageId] || 0;
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Lead Pipeline</h3>
        <div className="flex gap-2">
          <button className="glass-card px-3 py-1 text-sm hover:text-white transition-colors">
            View All Leads
          </button>
          <button className="btn-gradient text-sm">
            + Add Lead
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const count = getStageCount(stage.id);
          const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;

          return (
            <div key={stage.id} className="glass-card p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span>{stage.icon}</span>
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <span className="text-[var(--re-text-tertiary)] text-xs">({count})</span>
                </div>
                <span className="text-sm font-bold" style={{ color: stage.color }}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ 
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}99 100%)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="glass-card px-4 py-2 text-sm flex-1 hover:text-white transition-colors">
          Import Leads
        </button>
      </div>
    </div>
  );
};
