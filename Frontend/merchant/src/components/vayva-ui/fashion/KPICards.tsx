'use client';

import React from 'react';
import { VayvaCard } from '../VayvaCard';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  gradient?: string;
  className?: string;
}

/**
 * Fashion KPI Card with gradient text display
 */
export const FashionKPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  gradient = 'from-green-500 to-purple-500',
  className,
}) => {
  const isPositive = change && change >= 0;
  
  return (
    <VayvaCard variant="glass" className={cn('p-6 hover-lift', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className={cn(
        'text-4xl font-bold mb-2 bg-gradient-to-r',
        gradient,
        '-webkit-background-clip:text',
        '-webkit-text-fill-color:transparent',
        'background-clip:text'
      )}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'font-medium px-2 py-0.5 rounded-full',
            isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          )}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-gray-500">{changeLabel}</span>
        </div>
      )}
    </VayvaCard>
  );
};

/**
 * Gradient Orb Background Component
 */
export const GradientOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-green-300 to-purple-300 rounded-full opacity-30 blur-3xl"
        style={{
          animation: 'float 20s infinite ease-in-out',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-300 to-red-300 rounded-full opacity-30 blur-3xl"
        style={{
          animation: 'float 25s infinite ease-in-out reverse',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-20 blur-3xl"
        style={{
          animation: 'float 30s infinite ease-in-out',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};
