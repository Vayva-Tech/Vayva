import React from 'react';
import { GlassPanel , SparklineChart , TrendIndicator } from '@vayva/ui/fashion';

export interface KPICardProps {
  id: string;
  label: string;
  value: number | string;
  change: number;
  sparklineData?: number[];
  format?: 'currency' | 'number' | 'percent';
  inverted?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  label,
  value,
  change,
  sparklineData = [],
  format = 'number',
  inverted = false,
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
      case 'percent':
        return `${(val * 100).toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <GlassPanel variant="interactive" hoverEffect className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-2">{label}</h3>
        <div className="text-3xl font-bold text-white mb-3">
          {formatValue(value)}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <TrendIndicator value={change * 100} size="sm" inverted={inverted} />
        {sparklineData.length > 0 && (
          <SparklineChart
            data={sparklineData}
            color={change >= 0 ? '#10B981' : '#EF4444'}
            height={35}
          />
        )}
      </div>
    </GlassPanel>
  );
};

export default KPICard;
