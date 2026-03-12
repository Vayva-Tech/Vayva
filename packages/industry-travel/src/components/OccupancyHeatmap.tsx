/**
 * OccupancyHeatmap Widget
 * 
 * Visual calendar heatmap showing property occupancy rates over time.
 * Color intensity represents occupancy percentage.
 */

import { useMemo } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';

export interface OccupancyDay {
  date: string; // ISO date string
  occupancyRate: number; // 0-100
  adr?: number; // Average Daily Rate
  revenue?: number;
}

export interface OccupancyHeatmapWidgetProps {
  widget: WidgetDefinition;
  widgetData?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  occupancyData: OccupancyDay[];
  viewMode?: 'month' | 'quarter' | 'year';
  showADR?: boolean;
  showRevenue?: boolean;
  thresholdConfig?: {
    low: number;
    medium: number;
    high: number;
  };
  onDateClick?: (date: string, data: OccupancyDay) => void;
}

interface DayCellProps {
  day: OccupancyDay;
  colorClass: string;
  onClick?: () => void;
}

function DayCell({ day, colorClass, onClick }: DayCellProps) {
  const date = new Date(day.date);
  const dayOfMonth = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });

  return (
    <div
      onClick={onClick}
      className={`relative p-2 rounded-lg cursor-pointer transition-all hover:scale-110 hover:shadow-lg ${colorClass}`}
    >
      <div className="text-xs font-medium opacity-70">{month}</div>
      <div className="text-lg font-bold">{dayOfMonth}</div>
      <div className="text-xs font-semibold mt-1">{day.occupancyRate}%</div>
      
      {/* Tooltip on hover */}
      <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2 text-white text-xs">
        <div className="text-center">
          <div className="font-bold">{day.occupancyRate}% Occupied</div>
          {day.adr && <div>ADR: ₦{day.adr.toLocaleString()}</div>}
          {day.revenue && <div>Rev: ₦{day.revenue.toLocaleString()}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * OccupancyHeatmapWidget Component
 */
export function OccupancyHeatmapWidget({
  widget,
  isLoading,
  error,
  occupancyData = [],
  viewMode = 'month',
  showADR = true,
  showRevenue = false,
  thresholdConfig = { low: 50, medium: 75, high: 90 },
  onDateClick,
}: OccupancyHeatmapWidgetProps) {
  const getColorForOccupancy = (rate: number): string => {
    if (rate >= thresholdConfig.high) {
      return 'bg-gradient-to-br from-green-400 to-emerald-600 text-white';
    } else if (rate >= thresholdConfig.medium) {
      return 'bg-gradient-to-br from-lime-400 to-green-600 text-white';
    } else if (rate >= thresholdConfig.low) {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
    } else {
      return 'bg-gradient-to-br from-red-400 to-rose-600 text-white';
    }
  };

  const groupedData = useMemo(() => {
    const months: Record<string, OccupancyDay[]> = {};
  
    occupancyData.forEach((day: OccupancyDay) => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(day);
    });
  
    return months;
  }, [occupancyData]);
  
  const stats = useMemo(() => {
    if (occupancyData.length === 0) return null;
  
    const avgOccupancy = occupancyData.reduce((sum: number, d: OccupancyDay) => sum + d.occupancyRate, 0) / occupancyData.length;
    const avgADR = occupancyData.filter((d: OccupancyDay) => d.adr).reduce((sum: number, d: OccupancyDay) => sum + (d.adr || 0), 0) / occupancyData.filter((d: OccupancyDay) => d.adr).length;
    const totalRevenue = occupancyData.reduce((sum: number, d: OccupancyDay) => sum + (d.revenue || 0), 0);
    const peakDays = occupancyData.filter((d: OccupancyDay) => d.occupancyRate >= thresholdConfig.high).length;
    const lowDays = occupancyData.filter((d: OccupancyDay) => d.occupancyRate < thresholdConfig.low).length;

    return {
      avgOccupancy: Math.round(avgOccupancy),
      avgADR: Math.round(avgADR),
      totalRevenue,
      peakDays,
      lowDays,
    };
  }, [occupancyData, thresholdConfig]);

  const renderLegend = () => (
    <div className="flex items-center gap-4 text-xs">
      <span className="text-gray-600 font-medium">Legend:</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400 to-rose-600" />
        <span>&lt;{thresholdConfig.low}%</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-orange-500" />
        <span>{thresholdConfig.low}-{thresholdConfig.medium}%</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-lime-400 to-green-600" />
        <span>{thresholdConfig.medium}-{thresholdConfig.high}%</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-600" />
        <span>&gt;{thresholdConfig.high}%</span>
      </div>
    </div>
  );

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="occupancy-heatmap-widget"
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgOccupancy}%</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Avg ADR</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.avgADR.toLocaleString()}</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Peak Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.peakDays}</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Low Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowDays}</p>
            </div>
          </div>
        )}

        {/* Legend */}
        {renderLegend()}

        {/* Heatmap Grid */}
        {Object.entries(groupedData).map(([monthKey, days]) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month)).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          });

          return (
            <div key={monthKey} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for padding */}
                {Array.from({ length: new Date(parseInt(year), parseInt(month), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {/* Day cells */}
                {days.map((day) => (
                  <DayCell
                    key={day.date}
                    day={day}
                    colorClass={getColorForOccupancy(day.occupancyRate)}
                    onClick={() => onDateClick?.(day.date, day)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Insights */}
        {occupancyData.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Performance Insights</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-600">Best performing day:</span>
                <span className="font-semibold text-green-600">
                  {(() => {
                    const best = occupancyData.reduce((max: OccupancyDay, d: OccupancyDay) => d.occupancyRate > max.occupancyRate ? d : max, occupancyData[0]);
                    return `${new Date(best.date).toLocaleDateString()} (${best.occupancyRate}%)`;
                  })()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Lowest performing day:</span>
                <span className="font-semibold text-red-600">
                  {(() => {
                    const worst = occupancyData.reduce((min: OccupancyDay, d: OccupancyDay) => d.occupancyRate < min.occupancyRate ? d : min, occupancyData[0]);
                    return `${new Date(worst.date).toLocaleDateString()} (${worst.occupancyRate}%)`;
                  })()}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

OccupancyHeatmapWidget.displayName = 'OccupancyHeatmapWidget';

export default OccupancyHeatmapWidget;
