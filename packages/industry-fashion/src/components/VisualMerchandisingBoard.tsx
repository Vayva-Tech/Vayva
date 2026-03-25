import { Button } from "@vayva/ui";
import React from 'react';
import { GlassPanel } from '@vayva/ui/fashion';
import type { Lookbook } from '../types';

export interface VisualMerchandisingBoardProps {
  lookbooks: Lookbook[];
  onCreateLookbook?: () => void;
  onManageAssets?: () => void;
}

export const VisualMerchandisingBoard: React.FC<VisualMerchandisingBoardProps> = ({
  lookbooks,
  onCreateLookbook,
  onManageAssets,
}) => {
  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Visual Merchandising</h2>
        <div className="flex gap-2">
          {onCreateLookbook && (
            <Button
              onClick={onCreateLookbook}
              className="px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Create Lookbook
            </Button>
          )}
          {onManageAssets && (
            <Button
              onClick={onManageAssets}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
            >
              📷 Manage Assets
            </Button>
          )}
        </div>
      </div>

      {/* Lookbook Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {lookbooks.map((lookbook) => (
          <div
            key={lookbook.id}
            className="group relative bg-white/3 rounded-xl overflow-hidden border border-white/8 hover:border-rose-400/30 transition-all cursor-pointer"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={lookbook.images[0]}
                alt={lookbook.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
              <h3 className="text-sm font-semibold text-white">{lookbook.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-white/70">
                  {lookbook.views.toLocaleString()} views
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  {(lookbook.conversion * 100).toFixed(1)}% conv
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              {lookbook.status === 'published' && (
                <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full">
                  Published
                </span>
              )}
              {lookbook.status === 'draft' && (
                <span className="px-2 py-1 bg-amber-500/90 text-white text-xs font-medium rounded-full">
                  Draft
                </span>
              )}
              {lookbook.status === 'archived' && (
                <span className="px-2 py-1 bg-white/30 text-white text-xs font-medium rounded-full">
                  Archived
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        {onCreateLookbook && (
          <Button
            onClick={onCreateLookbook}
            className="bg-white/3 border-2 border-dashed border-white/20 hover:border-rose-400/50 rounded-xl flex flex-col items-center justify-center aspect-[3/4] transition-colors group"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">+</span>
            <span className="text-sm text-white/60 font-medium">New Lookbook</span>
          </Button>
        )}
      </div>

      {/* Active Lookbook Details */}
      {lookbooks.length > 0 && (
        <div className="bg-white/3 rounded-xl p-4 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                Active Lookbook: {lookbooks[0].name}
              </h3>
              <p className="text-sm text-white/60 mt-0.5">
                Status:{' '}
                <span className="text-emerald-400 font-medium capitalize">
                  {lookbooks[0].status}
                </span>{' '}
                | Views: {lookbooks[0].views.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Conversion Rate</p>
              <p className="text-lg font-bold text-emerald-400">
                {(lookbooks[0].conversion * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

export default VisualMerchandisingBoard;
