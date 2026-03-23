// @ts-nocheck
import React from 'react';
import { GlassPanel , ProgressBar } from '@vayva/ui/components/fashion';
import type { CollectionHealth } from '../types';

export interface CollectionHealthMatrixProps {
  collections: CollectionHealth[];
}

export const CollectionHealthMatrix: React.FC<CollectionHealthMatrixProps> = ({
  collections,
}) => {
  const getPerformanceColor = (performance: number) => {
    if (performance >= 75) return 'text-emerald-400';
    if (performance >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressBarColor = (performance: number) => {
    if (performance >= 75) return '#10B981';
    if (performance >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Collection Health</h2>
      
      <div className="space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white/3 rounded-xl p-4 border border-white/8 hover:border-rose-400/30 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Collection Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={collection.imageUrl}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Collection Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white truncate">
                    {collection.name}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${getPerformanceColor(
                      collection.performance
                    )} bg-white/5`}
                  >
                    {collection.performance}% healthy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-white/50 mb-1">GMV</p>
                    <p className="text-sm font-semibold text-white">
                      ${collection.gmv.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Units Sold</p>
                    <p className="text-sm font-semibold text-white">
                      {collection.units.toLocaleString()}
                    </p>
                  </div>
                </div>

                <ProgressBar
                  value={collection.performance}
                  max={100}
                  color={getProgressBarColor(collection.performance)}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

export default CollectionHealthMatrix;
