"use client";

import { Card, Button } from "@vayva/ui";

interface ClientInsightsProps {
  newClients?: number;
  regularClients?: number;
  vipClients?: number;
  retentionRate?: number;
  avgLifetimeValue?: number;
  isLoading?: boolean;
}

export function ClientInsights({
  newClients = 32,
  regularClients = 48,
  vipClients = 20,
  retentionRate = 78,
  avgLifetimeValue = 1842,
  isLoading = false,
}: ClientInsightsProps) {
  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Client Insights</h3>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
          View Analytics
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-white/5 rounded-lg"></div>
          <div className="h-12 bg-white/5 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Demographics */}
          <div className="mb-4">
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{newClients}%</p>
                <p className="text-gray-500 text-xs">New Clients</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{regularClients}%</p>
                <p className="text-gray-500 text-xs">Regular</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{vipClients}%</p>
                <p className="text-gray-500 text-xs">VIP</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Retention Rate:</span>
              <span className="text-green-400 font-semibold">{retentionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Avg Lifetime Value:</span>
              <span className="text-white font-semibold">${avgLifetimeValue}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
