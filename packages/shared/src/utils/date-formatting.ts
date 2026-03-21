/**
 * Advanced date formatting utilities
 */

/**
 * Format a date string or Date object to a locale-aware string (alternative version)
 */
export function formatDateAdvanced(
  date: string | Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
}

/**
 * Format date as relative time (e.g., "2 hours ago") (alternative version)
 */
export function formatRelativeTimeAdvanced(date: string | Date, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute');
  } else {
    return rtf.format(diffSecs, 'second');
  }
}

/**
 * Get start of period (day, week, month, year)
 */
export function startOfPeriod(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);
  
  switch (period) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week': {
      const day = result.getDay();
      const diff = result.getDate() - day + (day === 0 ? -6 : 1);
      result.setDate(diff);
      result.setHours(0, 0, 0, 0);
      break;
    }
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

/**
 * Calculate business days between two dates (excludes weekends)
 */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday or Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Convert date between timezones
 */
export function timezoneConverter(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const dateStr = date.toLocaleString('en-US', { timeZone: fromTimezone });
  return new Date(dateStr + ' UTC');
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}