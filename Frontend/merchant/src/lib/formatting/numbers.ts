/**
 * Number Formatting Utilities
 * 
 * Percentages, decimals, and locale-aware number formatting
 */

export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  showPercentage?: boolean;
  compact?: boolean;
}

const DEFAULT_NUMBER_OPTIONS: Required<NumberFormatOptions> = {
  locale: 'en-NG',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: true,
  showPercentage: false,
  compact: false,
};

/**
 * Format number with locale-aware formatting
 */
export function formatNumber(
  value: number | string,
  options?: NumberFormatOptions
): string {
  const opts = { ...DEFAULT_NUMBER_OPTIONS, ...options };
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '—';
  }

  // Compact notation for large numbers
  if (opts.compact) {
    return new Intl.NumberFormat(opts.locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(numericValue);
  }

  // Percentage
  if (opts.showPercentage) {
    return new Intl.NumberFormat(opts.locale, {
      style: 'percent',
      minimumFractionDigits: opts.minimumFractionDigits,
      maximumFractionDigits: opts.maximumFractionDigits,
      useGrouping: opts.useGrouping,
    }).format(numericValue / 100);
  }

  // Regular number
  return new Intl.NumberFormat(opts.locale, {
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
    useGrouping: opts.useGrouping,
  }).format(numericValue);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | string,
  options?: Omit<NumberFormatOptions, 'showPercentage'>
): string {
  return formatNumber(value, { ...options, showPercentage: true });
}

/**
 * Format decimal with precision control
 */
export function formatDecimal(
  value: number | string,
  precision: number = 2,
  options?: Omit<NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits'>
): string {
  return formatNumber(value, {
    ...options,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(
  value: number | string,
  options?: Omit<NumberFormatOptions, 'compact'>
): string {
  return formatNumber(value, { ...options, compact: true });
}

/**
 * Parse formatted number string back to number
 */
export function parseNumber(value: string): number {
  // Remove non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate average of array
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format percentage change with sign and color hint
 */
export function formatPercentageChange(
  oldValue: number,
  newValue: number,
  options?: { showSign?: boolean }
): { formatted: string; trend: 'up' | 'down' | 'neutral' } {
  const change = percentageChange(oldValue, newValue);
  const absChange = Math.abs(change);
  const trend: 'up' | 'down' | 'neutral' = 
    change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  const sign = options?.showSign !== false && change >= 0 ? '+' : '';
  const formatted = `${sign}${formatPercentage(change, { maximumFractionDigits: 1 })}`;
  
  return { formatted, trend };
}

/**
 * Format ratio as fraction string
 */
export function formatRatio(numerator: number, denominator: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  
  const num = numerator / divisor;
  const den = denominator / divisor;
  
  return `${num}:${den}`;
}

/**
 * Convert basis points to percentage
 */
export function basisPointsToPercentage(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points
 */
export function percentageToBasisPoints(pct: number): number {
  return pct * 100;
}
