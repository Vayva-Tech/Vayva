export { cn } from "@vayva/ui";
export declare const fetcher: <T = any>(url: string) => Promise<T>;
/**
 * Format a number as currency
 */
export declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
/**
 * Format a date
 */
export declare function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string;
/**
 * Normalizes a URL for comparison in the sidebar (e.g. active states)
 */
export declare function normalizeSidebarHref(rawHref: unknown): string;
/**
 * Client-side telemetry tracking
 */
export declare const telemetry: {
    track: (eventName: string, properties: Record<string, unknown>) => Promise<void>;
};
