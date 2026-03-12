/**
 * Regional Compliance & Localization
 * 
 * Utilities for multi-currency support, local payment methods,
 * and language localization for West African markets.
 */

// Supported currencies with formatting
export const CURRENCIES = {
  NGN: {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    locale: "en-NG",
    decimals: 2,
  },
  GHS: {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    locale: "en-GH",
    decimals: 2,
  },
  KES: {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    locale: "en-KE",
    decimals: 2,
  },
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
    decimals: 2,
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Format currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "NGN",
  options?: { showSymbol?: boolean; compact?: boolean }
): string {
  const { showSymbol = true, compact = false } = options || {};
  const currencyInfo = CURRENCIES[currency];

  const formatter = new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });

  const formatted = formatter.format(amount);

  // Use local symbol
  if (showSymbol && currencyInfo.symbol !== formatted[0]) {
    return `${currencyInfo.symbol}${formatted.replace(/[^0-9.,]/g, "")}`;
  }

  return formatted;
}

/**
 * Convert currency using exchange rates
 * In production, fetch from external API or cache
 */
export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  if (from === to) return amount;

  // Simplified rates - production should use real-time API
  const rates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    NGN: { NGN: 1, GHS: 0.0085, KES: 0.0905, USD: 0.00065 },
    GHS: { NGN: 117.65, GHS: 1, KES: 10.65, USD: 0.076 },
    KES: { NGN: 11.05, GHS: 0.094, KES: 1, USD: 0.0071 },
    USD: { NGN: 1538.46, GHS: 13.16, KES: 140.85, USD: 1 },
  };

  const rate = rates[from]?.[to];
  if (!rate) throw new Error(`Exchange rate not found for ${from} to ${to}`);

  return Math.round(amount * rate * 100) / 100;
}

// Local payment methods by region
export const PAYMENT_METHODS = {
  NG: {
    paystack: { name: "Paystack", active: true, currencies: ["NGN"] },
    bankTransfer: { name: "Bank Transfer", active: true, currencies: ["NGN"] },
    ussd: { name: "USSD", active: true, currencies: ["NGN"] },
  },
  GH: {
    paystack: { name: "Paystack", active: true, currencies: ["GHS"] },
    mobileMoney: { name: "MTN/Airtel Mobile Money", active: true, currencies: ["GHS"] },
  },
  KE: {
    mpesa: { name: "M-Pesa", active: true, currencies: ["KES"] },
    bankTransfer: { name: "Bank Transfer", active: true, currencies: ["KES"] },
  },
} as const;

export type CountryCode = keyof typeof PAYMENT_METHODS;

/**
 * Get available payment methods for a country
 */
export function getPaymentMethods(
  country: CountryCode,
  currency: CurrencyCode
): Array<{ id: string; name: string }> {
  const methods = PAYMENT_METHODS[country];
  return Object.entries(methods)
    .filter(([, config]) => config.active && config.currencies.includes(currency))
    .map(([id, config]) => ({ id, name: config.name }));
}

// Localization strings for supported languages
export const LOCALES = {
  en: {
    code: "en",
    name: "English",
    default: true,
  },
  twi: {
    code: "twi",
    name: "Twi",
    default: false,
  },
  sw: {
    code: "sw",
    name: "Swahili",
    default: false,
  },
  yo: {
    code: "yo",
    name: "Yoruba",
    default: false,
  },
} as const;

export type LocaleCode = keyof typeof LOCALES;

// Basic translations for UI elements
const TRANSLATIONS: Record<LocaleCode, Record<string, string>> = {
  en: {
    welcome: "Welcome",
    login: "Log in",
    signup: "Sign up",
    checkout: "Checkout",
    payNow: "Pay Now",
    orderSummary: "Order Summary",
    total: "Total",
    continue: "Continue",
    cancel: "Cancel",
    success: "Success",
    error: "Error",
    loading: "Loading",
  },
  twi: {
    welcome: "Akwaaba",
    login: "Kɔ mu",
    signup: "For ɛhyɛ",
    checkout: "Tua ka",
    payNow: "Tua Sika Seiseiara",
    orderSummary: "Order Ntam",
    total: "Nyinaa",
    continue: "Toa so",
    cancel: "Sɛe",
    success: "Nneyɛe pa",
    error: "Mfomso",
    loading: "Rɛloading",
  },
  sw: {
    welcome: "Karibu",
    login: "Ingia",
    signup: "Jisajili",
    checkout: "Lipa",
    payNow: "Lipa Sasa",
    orderSummary: "Muhtasari wa Oda",
    total: "Jumla",
    continue: "Endelea",
    cancel: "Ghairi",
    success: "Mafanikio",
    error: "Kosa",
    loading: "Inapakia",
  },
  yo: {
    welcome: "Kaabo",
    login: "Wọle",
    signup: "Forukọsilẹ",
    checkout: "Ṣe isun",
    payNow: "San Nísinsìnyí",
    orderSummary: "Àkópọ̀ ìbéèrè",
    total: "Lápapọ̀",
    continue: "Tẹ̀síwájú",
    cancel: "Fagilé",
    success: "Àṣeyọrí",
    error: "Aṣiṣe",
    loading: "Ìsàkóso",
  },
};

/**
 * Translate a key to the current locale
 */
export function t(key: string, locale: LocaleCode = "en", params?: Record<string, string>): string {
  let text = TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{{${param}}}`, value);
    });
  }

  return text;
}

/**
 * Detect country from IP or browser settings
 */
export function detectCountry(): CountryCode {
  // Check for saved preference
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("userCountry") as CountryCode;
    if (saved && PAYMENT_METHODS[saved]) return saved;
  }

  // Check browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (timezone.includes("Lagos") || timezone.includes("Africa/Lagos")) return "NG";
  if (timezone.includes("Accra") || timezone.includes("Africa/Accra")) return "GH";
  if (timezone.includes("Nairobi") || timezone.includes("Africa/Nairobi")) return "KE";

  // Default to Nigeria
  return "NG";
}

/**
 * Get tax rate for a country
 */
export function getTaxRate(country: CountryCode): number {
  const rates: Record<CountryCode, number> = {
    NG: 0.075, // 7.5% VAT
    GH: 0.15,  // 15% VAT
    KE: 0.16,  // 16% VAT
  };

  return rates[country] || 0;
}

/**
 * Compliance check for a region
 */
export interface ComplianceCheck {
  kycRequired: boolean;
  maxTransactionAmount: number;
  requiresRegistration: boolean;
  supportedCurrencies: CurrencyCode[];
}

export function getComplianceRequirements(country: CountryCode): ComplianceCheck {
  const requirements: Record<CountryCode, ComplianceCheck> = {
    NG: {
      kycRequired: true,
      maxTransactionAmount: 5000000, // ₦5M
      requiresRegistration: true,
      supportedCurrencies: ["NGN", "USD"],
    },
    GH: {
      kycRequired: true,
      maxTransactionAmount: 50000, // GH₵50k
      requiresRegistration: true,
      supportedCurrencies: ["GHS", "USD"],
    },
    KE: {
      kycRequired: true,
      maxTransactionAmount: 1000000, // KSh 1M
      requiresRegistration: true,
      supportedCurrencies: ["KES", "USD"],
    },
  };

  return requirements[country];
}

/**
 * Phone number formatting utilities
 */
export function formatPhoneNumber(
  phone: string,
  country: CountryCode
): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  const prefixes: Record<CountryCode, { countryCode: string; format: number[] }> = {
    NG: { countryCode: "234", format: [3, 3, 4] }, // +234 XXX XXX XXXX
    GH: { countryCode: "233", format: [2, 3, 4] }, // +233 XX XXX XXXX
    KE: { countryCode: "254", format: [3, 3, 4] }, // +254 XXX XXX XXXX
  };

  const config = prefixes[country];
  if (!config) return phone;

  // Remove country code if present
  let local = digits;
  if (local.startsWith(config.countryCode)) {
    local = local.slice(config.countryCode.length);
  } else if (local.startsWith("0")) {
    local = local.slice(1);
  }

  // Format
  let formatted = `+${config.countryCode}`;
  let index = 0;
  for (const length of config.format) {
    if (index + length <= local.length) {
      formatted += " " + local.slice(index, index + length);
      index += length;
    }
  }

  return formatted;
}
