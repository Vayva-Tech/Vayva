import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import type { InventoryVariant } from '../types';

export interface InventoryVariantHeatmapProps {
  variants: InventoryVariant[];
  sizes?: string[];
  colors?: string[];
}

export const InventoryVariantHeatmap: React.FC<InventoryVariantHeatmapProps> = ({
  variants,
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors = [
    { name: 'Red', code: '🔴' },
    { name: 'Blue', code: '🔵' },
    { name: 'Black', code: '⚫' },
    { name: 'White', code: '⚪' },
  ],
}) => {
  const getStockStatus = (quantity: number) => {
    if (quantity <= 5) return 'critical';
    if (quantity <= 15) return 'low';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-rose-500/80 text-white';
      case 'low':
        return 'bg-amber-500/80 text-white';
      default:
        return 'bg-emerald-500/80 text-white';
    }
  };

  // Group variants by color
  const variantsByColor = colors.map((color) => ({
    color,
    data: sizes.map((size) => {
      const variant = variants.find(
        (v) => v.size === size && v.color === color.name
      );
      return {
        size,
        quantity: variant?.quantity || 0,
        status: variant?.status || getStockStatus(variant?.quantity || 0),
      };
    }),
  }));

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Inventory by Variant</h2>
        <button className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
          View Full Inventory →
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-white/50 pb-3 pl-2">
                Color / Size
              </th>
              {sizes.map((size) => (
                <th
                  key={size}
                  className="text-center text-xs font-medium text-white/50 pb-3 min-w-[60px]"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variantsByColor.map(({ color, data }) => (
              <tr key={color.name}>
                <td className="py-2 pl-2">
                  <span className="text-sm text-white/90">{color.code}</span>
                </td>
                {data.map(({ size, quantity, status }) => (
                  <td key={size} className="py-2 px-1">
                    <div
                      className={`w-full h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${getStatusColor(
                        status
                      )}`}
                      title={`${size} - ${quantity} units`}
                    >
                      {quantity}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="text-xs text-white/60">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="text-xs text-white/60">Low Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs text-white/60">Healthy</span>
        </div>
      </div>
    </GlassPanel>
  );
};

export default InventoryVariantHeatmap;
