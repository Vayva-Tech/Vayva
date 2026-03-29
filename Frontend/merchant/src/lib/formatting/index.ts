/**
 * Formatting Module
 * 
 * Currency, dates, numbers, and units formatting utilities
 */

// Currency
export {
  formatCurrency,
  formatNumber,
  getCurrencySymbol,
  parseCurrency,
  formatKobo,
  toKobo,
  formatCompactCurrency,
  calculatePercentage,
  formatDiscount,
  formatPriceRange,
  type CurrencyCode,
  type CurrencyFormatOptions,
} from './currency';

// Dates
export {
  formatDate,
  formatRelativeTime,
  formatTime,
  formatDateRange,
  isToday,
  isYesterday,
  formatSmartDate,
  getDaysBetween,
  addDays,
  formatDuration,
  type DateFormatOptions,
  type RelativeTimeUnit,
} from './dates';

// Numbers
export {
  formatNumber as formatNumeric,
  formatPercentage,
  formatDecimal,
  formatCompactNumber,
  parseNumber,
  clamp,
  roundTo,
  average,
  percentageChange,
  formatPercentageChange,
  formatRatio,
  basisPointsToPercentage,
  percentageToBasisPoints,
  type NumberFormatOptions,
} from './numbers';

// Units
export {
  formatWeight,
  toGrams,
  fromGrams,
  formatVolume,
  toMilliliters,
  formatLength,
  formatDimensions,
  formatTimeDuration,
  formatPreparationTime,
  formatServiceDuration,
  formatArea,
  formatTemperature,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  type WeightUnit,
  type VolumeUnit,
  type LengthUnit,
  type TimeUnit,
  type UnitFormatOptions,
} from './units';
