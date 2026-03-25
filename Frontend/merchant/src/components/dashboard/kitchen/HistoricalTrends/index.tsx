'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart3, Calendar } from 'lucide-react';

interface HistoricalTrendsProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

/**
 * HistoricalTrends Component
 * 
 * Displays historical analytics and trends for kitchen operations
 */
export function HistoricalTrends({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: HistoricalTrendsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metric, setMetric] = useState<'ticket-times' | 'accuracy' | 'efficiency'>('ticket-times');

  // Mock historical data - would come from API
  const trendsData = {
    'ticket-times': {
      currentValue: 12.5,
      previousValue: 14.2,
      change: -11.97,
      trend: 'down', // down is good for ticket times
      data: [
        { date: 'Week 1', value: 15.2 },
        { date: 'Week 2', value: 14.8 },
        { date: 'Week 3', value: 13.5 },
        { date: 'Week 4', value: 12.5 },
      ],
      goal: 10,
    },
    accuracy: {
      currentValue: 96.8,
      previousValue: 94.2,
      change: 2.76,
      trend: 'up',
      data: [
        { date: 'Week 1', value: 93.5 },
        { date: 'Week 2', value: 94.8 },
        { date: 'Week 3', value: 95.5 },
        { date: 'Week 4', value: 96.8 },
      ],
      goal: 98,
    },
    efficiency: {
      currentValue: 88.5,
      previousValue: 85.3,
      change: 3.75,
      trend: 'up',
      data: [
        { date: 'Week 1', value: 84.2 },
        { date: 'Week 2', value: 86.5 },
        { date: 'Week 3', value: 87.8 },
        { date: 'Week 4', value: 88.5 },
      ],
      goal: 90,
    },
  };

  const currentData = trendsData[metric];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Historical Trends</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ticket-times">Ticket Times</option>
            <option value="accuracy">Order Accuracy</option>
            <option value="efficiency">Station Efficiency</option>
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Current Average</p>
          <p className="text-2xl font-bold text-gray-900">
            {currentData.currentValue.toFixed(1)}
            {metric === 'ticket-times' ? ' min' : '%'}
          </p>
          <div className={`flex items-center gap-1 mt-2 ${
            currentData.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {currentData.trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {currentData.change > 0 ? '+' : ''}{currentData.change.toFixed(1)}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Previous Average</p>
          <p className="text-2xl font-bold text-gray-900">
            {currentData.previousValue.toFixed(1)}
            {metric === 'ticket-times' ? ' min' : '%'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Last {timeRange}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Goal</p>
          <p className="text-2xl font-bold text-blue-600">
            {currentData.goal}
            {metric === 'ticket-times' ? ' min' : '%'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Target</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Performance Over Time</h4>
        
        <div className="space-y-4">
          {currentData.data.map((point, index) => {
            const percentage = (point.value / Math.max(...currentData.data.map(d => d.value))) * 100;
            const isImproving = index > 0 && point.value < currentData.data[index - 1].value;
            
            return (
              <div key={point.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{point.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">
                      {point.value.toFixed(1)}
                      {metric === 'ticket-times' ? ' min' : '%'}
                    </span>
                    {index > 0 && (
                      <span className={`text-xs ${
                        isImproving ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isImproving ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric === 'ticket-times'
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                        : isImproving
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Performance Insight</h4>
            <p className="text-sm text-blue-800">
              {metric === 'ticket-times' && (
                <>
                  Ticket times have improved by {currentData.change.toFixed(1)}% over the last {timeRange}. 
                  At this rate, you'll reach your goal of {currentData.goal} minutes in approximately 2 weeks.
                </>
              )}
              {metric === 'accuracy' && (
                <>
                  Order accuracy is trending upward! You're {currentData.goal - currentData.currentValue}% away 
                  from your goal. Consider implementing double-check procedures during rush hours.
                </>
              )}
              {metric === 'efficiency' && (
                <>
                  Station efficiency has improved consistently. The kitchen is operating at {currentData.currentValue}% 
                  capacity, which is excellent for {timeRange === '7d' ? 'this week' : 'this period'}.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

