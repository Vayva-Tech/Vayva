import { formatInTimeZone } from "date-fns-tz";
// Defaults
const DEFAULT_LOCALE = "en-NG";
const DEFAULT_CURRENCY = "NGN";
const DEFAULT_TIMEZONE = "Africa/Lagos";
/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency ISO 4217 Currency Code
 * @param locale Locale string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatCurrency(amount: any, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
        }).format(amount);
    }
    catch (_error) {
        // Fallback if currency/locale is invalid
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: "currency",
            currency: DEFAULT_CURRENCY,
        }).format(amount);
    }
}
/**
 * Format a date with timezone awareness
 * @param date Date object or string
 * @param formatStr Format string (date-fns)
 * @param timezone IANA Timezone string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatDateTime(date: any, formatStr = "PPP p", timezone = DEFAULT_TIMEZONE) {
    try {
        const d = new Date(date);
        return formatInTimeZone(d, timezone, formatStr);
    }
    catch (_error) {
        return date.toString();
    }
}
/**
 * Get readable timezone name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTimezoneName(timezone: string) {
    return timezone.replace(/_/g, " ");
}
