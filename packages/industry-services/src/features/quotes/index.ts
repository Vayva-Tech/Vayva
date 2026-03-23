// @ts-nocheck
/**
 * Quotes Feature Module
 * Dedicated module for quote functionality
 */

export * from '../../services/quote-service';

export interface QuoteFeatureConfig {
  defaultValidityDays: number;
  enableTaxCalculation: boolean;
  defaultTaxRate: number;
  enableQuoteTemplates: boolean;
  requireCustomerSignature: boolean;
}

export const DEFAULT_QUOTE_CONFIG: QuoteFeatureConfig = {
  defaultValidityDays: 30,
  enableTaxCalculation: true,
  defaultTaxRate: 7.5,
  enableQuoteTemplates: true,
  requireCustomerSignature: false,
};