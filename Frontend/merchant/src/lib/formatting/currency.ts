/**
 * Currency Formatting Utilities
 * 
 * Multi-currency support with focus on Nigerian Naira (NGN)
 */

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyFormatOptions {
  currency?: CurrencyCode | string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  showThousandsSeparator?: boolean;
}

/**
 * Currency symbols mapping
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Default options for Nigerian formatting
 */
const DEFAULT_OPTIONS: Required<CurrencyFormatOptions> = {
  currency: 'NGN',
  locale: 'en-NG',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  showSymbol: true,
  showThousandsSeparator: true,
};

/**
 * Format amount as currency
 */
export function formatCurrency(
  amount: unknown,
  options?: CurrencyFormatOptions
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Convert to number safely
  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount) 
    : typeof amount === 'number'
      ? amount
      : 0;

  if (isNaN(numericAmount)) {
    return formatCurrency(0, options);
  }

  // Build format options
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: opts.currency,
    minimumFractionDigits: opts.minimumFractionDigits,
    maximumFractionDigits: opts.maximumFractionDigits,
    useGrouping: opts.showThousandsSeparator,
  };

  const formatter = new Intl.NumberFormat(opts.locale, formatOptions);
  const formatted = formatter.format(numericAmount);

  return formatted;
}

/**
 * Format amount without currency symbol
 */
export function formatNumber(
  amount: unknown,
  options?: Omit<CurrencyFormatOptions, 'showSymbol'>
): string {
  return formatCurrency(amount, { ...options, showSymbol: false });
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value
    .replace(/[^\d.,-]/g, '')
    .replace(/,/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format amount in kobo (smallest unit)
 */
export function formatKobo(kobo: number, options?: CurrencyFormatOptions): string {
  const naira = kobo / 100;
  return formatCurrency(naira, options);
}

/**
 * Convert to kobo from naira
 */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Format large amounts with abbreviations
 */
export function formatCompactCurrency(
  amount: number,
  options?: CurrencyFormatOptions
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const formatter = new Intl.NumberFormat(opts.locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  const symbol = opts.showSymbol ? getCurrencySymbol(opts.currency) : '';
  const formatted = formatter.format(amount);

  return `${symbol}${formatted}`;
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(
  amount: number,
  percentage: number
): number {
  return (amount * percentage) / 100;
}

/**
 * Format discount amount
 */
export function formatDiscount(
  originalPrice: number,
  discountedPrice: number,
  options?: CurrencyFormatOptions
): string {
  const discount = originalPrice - discountedPrice;
  const percentage = ((discount / originalPrice) * 100).toFixed(0);
  
  return `${formatCurrency(discount, options)} (${percentage}% off)`;
}

/**
 * Format price range
 */
export function formatPriceRange(
  min: number,
  max: number,
  options?: CurrencyFormatOptions
): string {
  if (min === max) {
    return formatCurrency(min, options);
  }
  
  const from = formatCurrency(min, options);
  const to = formatCurrency(max, options);
  
  return `${from} - ${to}`;
}
