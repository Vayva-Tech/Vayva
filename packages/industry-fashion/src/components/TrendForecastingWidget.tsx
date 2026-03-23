// @ts-nocheck
import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import type { TrendData } from '../types';

export interface TrendForecastingWidgetProps {
  trends: TrendData[];
  forecastData?: number[];
}

export const TrendForecastingWidget: React.FC<TrendForecastingWidgetProps> = ({
  trends,
  forecastData,
}) => {
  return (
    <GlassPanel variant="elevated" className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Trend Forecasting</h2>

      {/* Emerging Trends */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
          <span>📈</span> Emerging Trends
        </h3>
        <div className="space-y-3">
          {trends.slice(0, 4).map((trend, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/3 rounded-lg p-3 border border-white/8"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white/30">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{trend.name}</p>
                  <p className="text-xs text-white/50">{trend.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-400">
                  ↑ {trend.growth.toFixed(0)}%
                </span>
                <div className="text-xs text-white/40 mt-0.5">
                  Confidence: {(trend.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Forecast Chart */}
      {forecastData && forecastData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">
            Seasonal Forecast (6 months)
          </h3>
          <div className="h-32 bg-white/3 rounded-lg p-4 border border-white/8 flex items-end gap-2">
            {forecastData.map((value, index) => {
              const height = `${Math.max(20, (value / Math.max(...forecastData)) * 100)}%`;
              return (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-rose-400/80 to-rose-300/80 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height }}
                  title={`Month ${index + 1}: ${value.toFixed(0)}%`}
                />
              );
            })}
          </div>
        </div>
      )}

      <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-rose-400 text-sm font-medium rounded-lg transition-colors border border-white/10">
        View Full Report →
      </button>
    </GlassPanel>
  );
};

export default TrendForecastingWidget;
