/**
 * FORMATTING UTILITIES - Monorepo Source of Truth
 */

/**
 * Formats a number as a currency string.
 * @param amount - The numeric amount to format
 * @param currency - The currency code (default: NGN)
 * @returns A formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Formats a date into a standard long-form string.
 * @param date - The date to format (string, number, or Date object)
 * @returns A formatted date string
 */
export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date into a short-form string.
 * @param date - The date to format
 * @returns A formatted short date string
 */
export function formatShortDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date with time.
 * @param date - The date to format
 * @returns A formatted date and time string
 */
export function formatDateTime(date: string | number | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
