import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { DonutChart } from '@vayva/ui/components/fashion';
import { ProgressBar } from '@vayva/ui/components/fashion';
import type { SizeCurveData, SizeDistribution } from '../types';

export interface SizeCurveAnalysisProps {
  data: SizeCurveData;
  categories?: string[];
}

export const SizeCurveAnalysis: React.FC<SizeCurveAnalysisProps> = ({
  data,
  categories = ['Tops', 'Bottoms', 'Dresses'],
}) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const chartData = data.distribution.map((item: SizeDistribution) => ({
    label: item.size,
    value: item.percentage,
  }));

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Size Curve Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <DonutChart
            data={chartData}
            size={180}
            showLabels={true}
            showPercentage={true}
          />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-white/70 mb-1">
              Top Size: <span className="font-semibold text-rose-400">{data.topSize}</span>
            </p>
            {data.restockAlerts.length > 0 && (
              <p className="text-xs text-amber-400">
                ⚠️ Restock Alert: {data.restockAlerts[0].size} running low
              </p>
            )}
          </div>
        </div>

        {/* Right: Category Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">
            Size Performance by Category
          </h3>
          
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-rose-400 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Size Distribution Bars */}
          <div className="space-y-2">
            {data.distribution.map((size: SizeDistribution) => (
              <ProgressBar
                key={size.size}
                value={size.units}
                max={Math.max(...data.distribution.map((d: SizeDistribution) => d.units))}
                label={`${size.size} - ${size.percentage.toFixed(1)}%`}
                color="#E8B4B8"
                size="sm"
              />
            ))}
          </div>

          <button className="mt-4 text-xs text-rose-400 hover:text-rose-300 transition-colors">
            View Size Guide →
          </button>
        </div>
      </div>
    </GlassPanel>
  );
};

export default SizeCurveAnalysis;
