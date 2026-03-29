/**
 * FORMATTING UTILITIES - Monorepo Source of Truth
 */
/**
 * Formats a number as a currency string.
 * @param amount - The numeric amount to format
 * @param currency - The currency code (default: NGN)
 * @returns A formatted currency string
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Formats a date into a standard long-form string.
 * @param date - The date to format (string, number, or Date object)
 * @returns A formatted date string
 */
export declare function formatDate(date: string | number | Date): string;
/**
 * Formats a date into a short-form string.
 * @param date - The date to format
 * @returns A formatted short date string
 */
export declare function formatShortDate(date: string | number | Date): string;
/**
 * Formats a date with time.
 * @param date - The date to format
 * @returns A formatted date and time string
 */
export declare function formatDateTime(date: string | number | Date): string;
//# sourceMappingURL=format.d.ts.map