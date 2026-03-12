import React from 'react';

export interface CohortData {
  cohort: string;
  size: number;
  retentionRates: number[];
  revenue: number;
  avgOrderValue: number;
}

export interface CohortAnalysisProps {
  cohorts?: CohortData[];
  period?: 'monthly' | 'weekly';
}

export const CohortAnalysis: React.FC<CohortAnalysisProps> = ({
  cohorts = [],
  period = 'monthly',
}) => {
  const maxRetention = Math.max(
    ...cohorts.flatMap((c) => c.retentionRates),
    0
  );

  const getRetentionColor = (rate: number) => {
    if (rate >= 0.6) return 'bg-emerald-400';
    if (rate >= 0.4) return 'bg-blue-400';
    if (rate >= 0.2) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Cohort Analysis</h2>
        <select
          value={period}
          onChange={(e) => {}}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-400"
        >
          <option value="monthly" className="bg-[#0F0F0F]">Monthly</option>
          <option value="weekly" className="bg-[#0F0F0F]">Weekly</option>
        </select>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Avg Retention (M1)</p>
          <p className="text-xl font-bold text-white">
            {(cohorts.reduce((sum, c) => sum + (c.retentionRates[0] || 0), 0) / (cohorts.length || 1) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Customers</p>
          <p className="text-xl font-bold text-white">
            {cohorts.reduce((sum, c) => sum + c.size, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-400">
            ${cohorts.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Avg Order Value</p>
          <p className="text-xl font-bold text-white">
            ${(cohorts.reduce((sum, c) => sum + c.avgOrderValue, 0) / (cohorts.length || 1)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Cohort Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase sticky left-0 bg-[#0F0F0F]">Cohort</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Size</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Revenue</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">AOV</th>
              {Array.from({ length: Math.max(...cohorts.map((c) => c.retentionRates.length), 0) }, (_, i) => (
                <th key={i} className="text-center py-3 px-2 text-xs font-medium text-white/60 uppercase min-w-[80px]">
                  {period === 'monthly' ? `M${i + 1}` : `W${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr
                key={cohort.cohort}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="py-4 px-4 sticky left-0 bg-[#0F0F0F]">
                  <span className="text-sm font-medium text-white">{cohort.cohort}</span>
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  {cohort.size.toLocaleString()}
                </td>
                <td className="text-right py-4 px-4 text-sm font-medium text-emerald-400">
                  ${cohort.revenue.toLocaleString()}
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  ${cohort.avgOrderValue.toFixed(2)}
                </td>
                {cohort.retentionRates.map((rate, idx) => (
                  <td key={idx} className="py-4 px-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full bg-white/10 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 right-0 ${getRetentionColor(rate)} transition-all`}
                          style={{ height: `${(rate / maxRetention) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getRetentionColor(rate).replace('bg-', 'text-')}`}>
                        {(rate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cohorts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-white/60">No cohort data available</p>
          <p className="text-xs text-white/40 mt-1">Customer retention data will appear here</p>
        </div>
      )}
    </div>
  );
};

export default CohortAnalysis;
