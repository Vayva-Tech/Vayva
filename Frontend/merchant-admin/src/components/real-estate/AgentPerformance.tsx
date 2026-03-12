"use client";

import React from "react";

interface Agent {
  id: string;
  name: string;
  sales: number;
  volume: number;
  commission: number;
}

export const AgentPerformance: React.FC = () => {
  const agents: Agent[] = [
    { id: '1', name: 'Sarah Johnson', sales: 12, volume: 842000, commission: 25260 },
    { id: '2', name: 'Michael Chen', sales: 9, volume: 624000, commission: 18720 },
    { id: '3', name: 'Emily Rodriguez', sales: 8, volume: 548000, commission: 16440 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxVolume = Math.max(...agents.map(a => a.volume));

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Top Agents This Month</h3>
        <button className="glass-card px-3 py-1 text-sm hover:text-white transition-colors">
          View All Agents
        </button>
      </div>

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div key={agent.id} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--re-accent-primary)] to-[var(--re-accent-secondary)] flex items-center justify-center text-lg font-bold">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{agent.name}</h4>
                    <p className="text-xs text-[var(--re-text-tertiary)]">
                      {agent.sales} sales | {formatCurrency(agent.volume)} volume
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--re-accent-primary)]">
                      {formatCurrency(agent.commission)}
                    </p>
                    <p className="text-xs text-[var(--re-text-tertiary)]">Commission</p>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(agent.volume / maxVolume) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--re-accent-primary)]/20">
        <h4 className="text-sm font-semibold mb-2">Team Stats</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[var(--re-text-tertiary)]">Total Sales:</span>
            <span className="ml-2 font-semibold">48</span>
          </div>
          <div>
            <span className="text-[var(--re-text-tertiary)]">Total Volume:</span>
            <span className="ml-2 font-semibold">$3.2M</span>
          </div>
          <div>
            <span className="text-[var(--re-text-tertiary)]">Avg. Commission:</span>
            <span className="ml-2 font-semibold">3.1%</span>
          </div>
          <div>
            <span className="text-[var(--re-text-tertiary)]">Conversion Rate:</span>
            <span className="ml-2 font-semibold">24.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
