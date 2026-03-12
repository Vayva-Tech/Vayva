import React from 'react';

export interface TrendIndicatorProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  showLabel = true,
  size = 'md',
  inverted = false,
}) => {
  const isPositive = value >= 0;
  const isNeutral = value === 0;
  
  // For metrics where lower is better (like return rate), invert the interpretation
  const isGood = inverted ? !isPositive : isPositive;
  
  const color = isNeutral
    ? 'text-white/60'
    : isGood
    ? 'text-emerald-400'
    : 'text-rose-400';
    
  const bgColor = isNeutral
    ? 'bg-white/10'
    : isGood
    ? 'bg-emerald-400/10'
    : 'bg-rose-400/10';

  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const arrowSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const renderArrow = () => {
    if (isNeutral) {
      return (
        <svg
          className={`${arrowSize[size]} ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14"
          />
        </svg>
      );
    }

    return (
      <svg
        className={`${arrowSize[size]} ${color} transform ${
          isPositive ? '' : 'rotate-180'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${bgColor} ${sizeStyles[size]}`}
    >
      {renderArrow()}
      {showLabel && (
        <span className={`font-medium ${color}`}>
          {isPositive ? '+' : ''}
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;
