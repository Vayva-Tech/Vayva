/**
 * Date and Time Formatting Utilities
 * 
 * Relative time, timezone-aware formatting, and industry-specific formats
 */

export type RelativeTimeUnit = 
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

export interface DateFormatOptions {
  format?: 'short' | 'long' | 'relative' | 'time' | 'datetime';
  locale?: string;
  timezone?: string;
  showSeconds?: boolean;
}

const DEFAULT_DATE_OPTIONS: Required<DateFormatOptions> = {
  format: 'datetime',
  locale: 'en-NG',
  timezone: 'Africa/Lagos',
  showSeconds: false,
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | number | Date,
  options?: Omit<DateFormatOptions, 'format'>
): string {
  const opts = { ...DEFAULT_DATE_OPTIONS, ...options };
  const now = new Date();
  const then = new Date(date);
  
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(opts.locale, { numeric: 'auto' });

  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second');
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffDays < 7) {
    return rtf.format(-diffDays, 'day');
  } else if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, 'week');
  } else if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month');
  } else {
    return rtf.format(-diffYears, 'year');
  }
}

/**
 * Format date with customizable options
 */
export function formatDate(
  date: string | number | Date | null | undefined,
  options?: DateFormatOptions
): string {
  if (!date) return '—';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';

    const opts = { ...DEFAULT_DATE_OPTIONS, ...options };
    
    switch (opts.format) {
      case 'short':
        return new Intl.DateTimeFormat(opts.locale, {
          dateStyle: 'short',
          timeZone: opts.timezone,
        }).format(d);

      case 'long':
        return new Intl.DateTimeFormat(opts.locale, {
          dateStyle: 'long',
          timeZone: opts.timezone,
        }).format(d);

      case 'relative':
        return formatRelativeTime(date, options);

      case 'time':
        return new Intl.DateTimeFormat(opts.locale, {
          hour: 'numeric',
          minute: 'numeric',
          second: opts.showSeconds ? 'numeric' : undefined,
          timeZone: opts.timezone,
        }).format(d);

      case 'datetime':
      default:
        return new Intl.DateTimeFormat(opts.locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: opts.timezone,
        }).format(d);
    }
  } catch {
    return '—';
  }
}

/**
 * Format as time only
 */
export function formatTime(
  date: string | number | Date,
  options?: { showSeconds?: boolean; locale?: string }
): string {
  return formatDate(date, {
    format: 'time',
    showSeconds: options?.showSeconds,
    locale: options?.locale,
  });
}

/**
 * Get formatted date range
 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  options?: DateFormatOptions
): string {
  const startDate = formatDate(start, options);
  const endDate = formatDate(end, options);
  
  return `${startDate} - ${endDate}`;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Format based on recency
 */
export function formatSmartDate(
  date: string | Date,
  options?: DateFormatOptions
): string {
  const d = new Date(date);
  
  if (isToday(d)) {
    return `Today at ${formatTime(d)}`;
  } else if (isYesterday(d)) {
    return `Yesterday at ${formatTime(d)}`;
  } else {
    return formatDate(date, options);
  }
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format duration in milliseconds to human-readable string
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
