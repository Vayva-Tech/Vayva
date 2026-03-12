import { prisma } from "@vayva/db";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  isDefault: boolean;
}

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  source: string;
  timestamp: Date;
}

export interface PriceConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  formatted: string;
}

// Supported currencies for Vayva platform
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", decimals: 2, isDefault: true },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", decimals: 2, isDefault: false },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2, isDefault: false },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2, isDefault: false },
  { code: "GHS", name: "Ghana Cedi", symbol: "₵", flag: "🇬🇭", decimals: 2, isDefault: false },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", decimals: 2, isDefault: false },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", decimals: 2, isDefault: false },
  { code: "XOF", name: "West African CFA", symbol: "CFA", flag: "🌍", decimals: 0, isDefault: false },
];

export class CurrencyService {
  private readonly API_KEY: string;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor() {
    this.API_KEY = process.env.EXCHANGE_RATE_API_KEY || "";
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  /**
   * Get default currency (NGN)
   */
  getDefaultCurrency(): Currency {
    return SUPPORTED_CURRENCIES.find((c) => c.isDefault) || SUPPORTED_CURRENCIES[0];
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
  }

  /**
   * Get store's preferred currencies
   */
  async getStoreCurrencies(storeId: string): Promise<{
    primary: Currency;
    enabled: Currency[];
    autoConvert: boolean;
  }> {
    const config = await prisma.storeCurrencyConfig.findUnique({
      where: { storeId },
    });

    if (!config) {
      // Return defaults
      return {
        primary: this.getDefaultCurrency(),
        enabled: [this.getDefaultCurrency()],
        autoConvert: true,
      };
    }

    const primary = this.getCurrency(config.primaryCurrency) || this.getDefaultCurrency();
    const enabled = config.enabledCurrencies
      .map((code) => this.getCurrency(code))
      .filter(Boolean) as Currency[];

    return {
      primary,
      enabled: enabled.length > 0 ? enabled : [primary],
      autoConvert: config.autoConvert,
    };
  }

  /**
   * Set store's currency configuration
   */
  async setStoreCurrencies(
    storeId: string,
    config: {
      primaryCurrency: string;
      enabledCurrencies: string[];
      autoConvert?: boolean;
    }
  ): Promise<void> {
    await prisma.storeCurrencyConfig.upsert({
      where: { storeId },
      create: {
        storeId,
        primaryCurrency: config.primaryCurrency.toUpperCase(),
        enabledCurrencies: config.enabledCurrencies.map((c) => c.toUpperCase()),
        autoConvert: config.autoConvert ?? true,
      },
      update: {
        primaryCurrency: config.primaryCurrency.toUpperCase(),
        enabledCurrencies: config.enabledCurrencies.map((c) => c.toUpperCase()),
        autoConvert: config.autoConvert ?? true,
      },
    });
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    if (fromCode === toCode) return 1;

    // Check cache first
    const cached = await this.getCachedRate(fromCode, toCode);
    if (cached) return cached;

    // Fetch from API
    const rate = await this.fetchExchangeRate(fromCode, toCode);
    
    // Cache the result
    await this.cacheRate(fromCode, toCode, rate);

    return rate;
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    from: string,
    to: string
  ): Promise<PriceConversion> {
    const rate = await this.getExchangeRate(from, to);
    const converted = Math.round(amount * rate);
    const targetCurrency = this.getCurrency(to) || this.getDefaultCurrency();

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: converted,
      targetCurrency: to,
      exchangeRate: rate,
      formatted: this.formatAmount(converted, targetCurrency),
    };
  }

  /**
   * Convert product prices for display
   */
  async convertProductPrices(
    products: Array<{
      id: string;
      price: number;
      compareAtPrice?: number | null;
    }>,
    from: string,
    to: string
  ): Promise<
    Array<{
      id: string;
      price: PriceConversion;
      compareAtPrice?: PriceConversion;
    }>
  > {
    const rate = await this.getExchangeRate(from, to);
    const targetCurrency = this.getCurrency(to) || this.getDefaultCurrency();

    return products.map((product) => ({
      id: product.id,
      price: {
        originalAmount: product.price,
        originalCurrency: from,
        convertedAmount: Math.round(product.price * rate),
        targetCurrency: to,
        exchangeRate: rate,
        formatted: this.formatAmount(Math.round(product.price * rate), targetCurrency),
      },
      compareAtPrice: product.compareAtPrice
        ? {
            originalAmount: product.compareAtPrice,
            originalCurrency: from,
            convertedAmount: Math.round(product.compareAtPrice * rate),
            targetCurrency: to,
            exchangeRate: rate,
            formatted: this.formatAmount(
              Math.round(product.compareAtPrice * rate),
              targetCurrency
            ),
          }
        : undefined,
    }));
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currency: Currency | string): string {
    const curr = typeof currency === "string" ? this.getCurrency(currency) : currency;
    if (!curr) return `${amount}`;

    const divisor = curr.decimals === 0 ? 1 : Math.pow(10, curr.decimals);
    const value = amount / divisor;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr.code,
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    }).format(value);
  }

  /**
   * Get customer's detected/selected currency
   */
  async getCustomerCurrency(
    storeId: string,
    customerLocation?: { country: string; ip: string }
  ): Promise<Currency> {
    const storeConfig = await this.getStoreCurrencies(storeId);

    // If only one currency enabled, use it
    if (storeConfig.enabled.length === 1) {
      return storeConfig.enabled[0];
    }

    // Try to detect from location
    if (customerLocation) {
      const detected = this.detectCurrencyFromCountry(customerLocation.country);
      if (detected && storeConfig.enabled.some((c) => c.code === detected.code)) {
        return detected;
      }
    }

    return storeConfig.primary;
  }

  /**
   * Get all exchange rates for a base currency
   */
  async getAllRates(base: string): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};
    
    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency.code !== base) {
        rates[currency.code] = await this.getExchangeRate(base, currency.code);
      }
    }

    rates[base] = 1;
    return rates;
  }

  /**
   * Update all exchange rates (cron job)
   */
  async updateExchangeRates(): Promise<void> {
    const base = "NGN";
    const rates = await this.fetchAllRates(base);

    for (const [target, rate] of Object.entries(rates)) {
      if (target !== base) {
        await this.cacheRate(base, target, rate);
      }
    }
  }

  /**
   * Detect currency from country code
   */
  private detectCurrencyFromCountry(country: string): Currency | undefined {
    const countryMap: Record<string, string> = {
      NG: "NGN",
      US: "USD",
      GB: "GBP",
      GH: "GHS",
      KE: "KES",
      ZA: "ZAR",
      SN: "XOF",
      CI: "XOF",
      BF: "XOF",
      BJ: "XOF",
      TG: "XOF",
      ML: "XOF",
      NE: "XOF",
    };

    const currencyCode = countryMap[country.toUpperCase()];
    return currencyCode ? this.getCurrency(currencyCode) : undefined;
  }

  /**
   * Get cached exchange rate
   */
  private async getCachedRate(from: string, to: string): Promise<number | null> {
    const key = `exchange_rate:${from}:${to}`;
    // Use Redis or similar cache
    // For now, check in-memory or database
    const cached = await prisma.exchangeRate.findUnique({
      where: { from_to: { from, to } },
    });

    if (!cached) return null;

    // Check if expired
    const age = Date.now() - cached.updatedAt.getTime();
    if (age > this.CACHE_TTL * 1000) return null;

    return cached.rate;
  }

  /**
   * Cache exchange rate
   */
  private async cacheRate(from: string, to: string, rate: number): Promise<void> {
    await prisma.exchangeRate.upsert({
      where: { from_to: { from, to } },
      create: {
        from,
        to,
        rate,
        source: "api",
        updatedAt: new Date(),
      },
      update: {
        rate,
        source: "api",
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchExchangeRate(from: string, to: string): Promise<number> {
    // Using a free API (exchangerate-api.com or similar)
    // In production, use a paid service for better reliability
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) throw new Error("Failed to fetch rates");

      const data = await response.json();
      const rate = data.rates[to];

      if (!rate) throw new Error(`Rate not found for ${to}`);

      return rate;
    } catch (error) {
      console.error("[Currency] Failed to fetch rate:", error);
      
      // Fallback to hardcoded rates for common pairs
      return this.getFallbackRate(from, to);
    }
  }

  /**
   * Fetch all rates for a base currency
   */
  private async fetchAllRates(base: string): Promise<Record<string, number>> {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${base}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) throw new Error("Failed to fetch rates");

      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error("[Currency] Failed to fetch all rates:", error);
      return {};
    }
  }

  /**
   * Get fallback rate for common pairs
   */
  private getFallbackRate(from: string, to: string): number {
    // Approximate rates (NGN-based)
    const rates: Record<string, number> = {
      "NGN:USD": 0.00065,
      "NGN:GBP": 0.00052,
      "NGN:EUR": 0.0006,
      "NGN:GHS": 0.009,
      "NGN:KES": 0.084,
      "NGN:ZAR": 0.012,
      "NGN:XOF": 0.4,
      "USD:NGN": 1540,
      "GBP:NGN": 1920,
      "EUR:NGN": 1660,
    };

    return rates[`${from}:${to}`] || 1;
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();
