/**
 * Format utilities for Vayva shared package
 */

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "NGN"
): string {
  if (amount === null || amount === undefined) return "—";

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";

  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("en-NG", defaultOptions).format(d);
}

export function formatDateTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";

  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Intl.DateTimeFormat("en-NG", defaultOptions).format(d);
}

export function formatRelativeTime(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "—";

  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 365) {
    return `${Math.floor(diffInDays / 365)}y ago`;
  } else if (diffInDays > 30) {
    return `${Math.floor(diffInDays / 30)}mo ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays}d ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours}h ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes}m ago`;
  } else {
    return "Just now";
  }
}

export function formatNumber(
  num: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (num === null || num === undefined) return "—";

  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "—";

  return new Intl.NumberFormat("en-NG", options).format(n);
}

export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return "—";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";

  return `${num.toFixed(decimals)}%`;
}
