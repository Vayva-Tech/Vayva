/**
 * Unit Formatting Utilities
 * 
 * Weight, volume, dimensions, and industry-specific units
 */

export type WeightUnit = 'g' | 'kg' | 'mg' | 'lb' | 'oz';
export type VolumeUnit = 'ml' | 'l' | 'fl oz' | 'gal';
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'yd';
export type TimeUnit = 'ms' | 's' | 'min' | 'h' | 'd' | 'wk';

export interface UnitFormatOptions {
  showUnit?: boolean;
  precision?: number;
  locale?: string;
}

const DEFAULT_UNIT_OPTIONS: Required<UnitFormatOptions> = {
  showUnit: true,
  precision: 2,
  locale: 'en-NG',
};

/**
 * Format weight
 */
export function formatWeight(
  value: number,
  unit: WeightUnit = 'kg',
  options?: UnitFormatOptions
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options };
  const formatted = value.toFixed(opts.precision);
  return opts.showUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Convert weight to grams
 */
export function toGrams(value: number, unit: WeightUnit): number {
  const conversions: Record<WeightUnit, number> = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    lb: 453.592,
    oz: 28.3495,
  };
  return value * conversions[unit];
}

/**
 * Convert grams to specified unit
 */
export function fromGrams(value: number, unit: WeightUnit): number {
  const conversions: Record<WeightUnit, number> = {
    g: 1,
    kg: 0.001,
    mg: 1000,
    lb: 0.00220462,
    oz: 0.035274,
  };
  return value * conversions[unit];
}

/**
 * Format volume
 */
export function formatVolume(
  value: number,
  unit: VolumeUnit = 'l',
  options?: UnitFormatOptions
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options };
  const formatted = value.toFixed(opts.precision);
  return opts.showUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Convert volume to milliliters
 */
export function toMilliliters(value: number, unit: VolumeUnit): number {
  const conversions: Record<VolumeUnit, number> = {
    ml: 1,
    l: 1000,
    'fl oz': 29.5735,
    gal: 3785.41,
  };
  return value * conversions[unit];
}

/**
 * Format length/dimensions
 */
export function formatLength(
  value: number,
  unit: LengthUnit = 'cm',
  options?: UnitFormatOptions
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options };
  const formatted = value.toFixed(opts.precision);
  return opts.showUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format dimensions (L x W x H)
 */
export function formatDimensions(
  length: number,
  width: number,
  height: number,
  unit: LengthUnit = 'cm',
  options?: UnitFormatOptions
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options };
  const l = length.toFixed(opts.precision);
  const w = width.toFixed(opts.precision);
  const h = height.toFixed(opts.precision);
  
  return opts.showUnit 
    ? `${l} × ${w} × ${h} ${unit}` 
    : `${l} × ${w} × ${h}`;
}

/**
 * Format time duration
 */
export function formatTimeDuration(
  value: number,
  unit: TimeUnit = 'min',
  options?: { showShort?: boolean }
): string {
  const isShort = options?.showShort ?? false;
  
  if (isShort) {
    return `${value}${unit}`;
  }

  const fullNames: Record<TimeUnit, string> = {
    ms: 'millisecond',
    s: 'second',
    min: 'minute',
    h: 'hour',
    d: 'day',
    wk: 'week',
  };

  const name = fullNames[unit];
  return value === 1 ? `1 ${name}` : `${value} ${name}s`;
}

/**
 * Format preparation/cooking time (for food industry)
 */
export function formatPreparationTime(minutes: number): string {
  if (minutes < 60) {
    return formatTimeDuration(minutes, 'min', { showShort: true });
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return formatTimeDuration(hours, 'h', { showShort: true });
  } else {
    const days = Math.round(minutes / 1440);
    return formatTimeDuration(days, 'd', { showShort: true });
  }
}

/**
 * Format service duration (for beauty industry)
 */
export function formatServiceDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Format area
 */
export function formatArea(
  value: number,
  unit: 'sq m' | 'sq ft' | 'sq yd' = 'sq m',
  options?: UnitFormatOptions
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options };
  const formatted = value.toFixed(opts.precision);
  return opts.showUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format temperature
 */
export function formatTemperature(
  value: number,
  unit: 'C' | 'F' = 'C',
  options?: Omit<UnitFormatOptions, 'precision'>
): string {
  const opts = { ...DEFAULT_UNIT_OPTIONS, ...options, precision: 1 };
  const formatted = value.toFixed(opts.precision);
  const symbol = unit === 'C' ? '°C' : '°F';
  return opts.showUnit ? `${formatted}${symbol}` : formatted;
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}
