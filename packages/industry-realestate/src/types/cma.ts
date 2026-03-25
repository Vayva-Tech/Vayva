/**
 * Comparative Market Analysis (CMA) Types
 * CMA generation and comparable property analysis
 */

import type { Property, PropertyListing, Address } from './property';

export type CMADataSource = 'mls' | 'public_records' | 'vayva_marketplace' | 'manual';

export interface CMAConfig {
  dataSources: CMADataSource[];
  compRadius: number; // miles
  compTimeframe: number; // days
  minComps: number;
  maxComps: number;
  adjustmentFactors: AdjustmentFactor[];
  includePending: boolean;
  includeExpired: boolean;
}

export interface AdjustmentFactor {
  feature: string;
  unitValue: number; // dollar amount per unit
  unit: 'sqft' | 'bedroom' | 'bathroom' | 'lot_sqft' | 'year' | 'fixed';
}

export interface CompProperty {
  id: string;
  listingId?: string;
  address: Address;
  propertyType: string;
  listPrice?: number;
  soldPrice: number;
  soldDate: Date;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  distance: number; // miles from subject
  daysOnMarket: number;
  dataSource: CMADataSource;
  adjustments: Adjustment[];
  adjustedPrice: number;
  similarityScore: number; // 0-1
}

export interface Adjustment {
  feature: string;
  difference: number;
  unitValue: number;
  amount: number; // positive or negative adjustment
}

export interface MarketTrend {
  period: string;
  avgSalePrice: number;
  pricePerSqft: number;
  avgDaysOnMarket: number;
  totalSales: number;
  priceChangePercent: number; // vs previous period
  inventoryLevel: 'low' | 'balanced' | 'high';
}

export interface ValueRange {
  low: number;
  high: number;
  recommended: number;
}

export interface CMAReport {
  id: string;
  merchantId: string;
  agentId?: string;
  subjectProperty: Property;
  estimatedValue: number;
  valueRange: ValueRange;
  pricePerSqft: number;
  comparableProperties: CompProperty[];
  adjustments: AdjustmentSummary;
  marketTrends: MarketTrend[];
  daysOnMarketEstimate: number;
  confidenceScore: number; // 0-100
  generatedAt: Date;
  expiresAt?: Date;
  pdfUrl?: string;
  notes?: string;
}

export interface AdjustmentSummary {
  totalAdjustments: number;
  netAdjustment: number;
  avgAdjustmentPerComp: number;
  largestAdjustment: number;
}

export interface CMARequest {
  propertyId: string;
  config?: Partial<CMAConfig>;
  notes?: string;
}

export interface CMAResponse {
  report: CMAReport;
  processingTime: number; // milliseconds
}

export interface CMAFilter {
  merchantId?: string;
  agentId?: string;
  propertyId?: string;
  generatedAfter?: Date;
  generatedBefore?: Date;
  minConfidenceScore?: number;
}

// Default CMA configuration
export const DEFAULT_CMA_CONFIG: CMAConfig = {
  dataSources: ['mls', 'public_records', 'vayva_marketplace'],
  compRadius: 1.0, // 1 mile
  compTimeframe: 90, // 90 days
  minComps: 3,
  maxComps: 10,
  includePending: true,
  includeExpired: false,
  adjustmentFactors: [
    { feature: 'square_feet', unitValue: 50, unit: 'sqft' },
    { feature: 'bedroom', unitValue: 10000, unit: 'bedroom' },
    { feature: 'bathroom', unitValue: 5000, unit: 'bathroom' },
    { feature: 'lot_size', unitValue: 2, unit: 'lot_sqft' },
    { feature: 'year_built', unitValue: 500, unit: 'year' },
    { feature: 'garage', unitValue: 5000, unit: 'fixed' },
    { feature: 'pool', unitValue: 8000, unit: 'fixed' },
  ],
};
