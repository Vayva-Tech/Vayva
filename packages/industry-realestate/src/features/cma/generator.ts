// @ts-nocheck
/**
 * CMA Generator
 * Main engine for generating Comparative Market Analysis reports
 */

import type { 
  CMAConfig, 
  CMAReport, 
  CMARequest, 
  CMAResponse,
  CompProperty,
  MarketTrend,
  Property,
  PropertyListing,
  ValueRange,
  AdjustmentSummary,
} from '../../types';
import { DEFAULT_CMA_CONFIG } from '../../types';
import { 
  calculateAdjustments, 
  calculateAdjustedPrice,
  calculateSimilarityScore,
  calculateAdjustmentSummary,
  validateAdjustments,
} from './adjustments';
import { 
  fetchAllComparables,
  filterByDistance,
  filterByTimeframe,
  rankComparables,
  selectBestComparables,
  validateComparablePool,
} from './comparables';

export interface CMAGenerationOptions {
  skipOutlierRemoval?: boolean;
  maxAdjustmentPercent?: number;
  includePending?: boolean;
}

/**
 * Calculate estimated value from comparables
 */
function calculateEstimatedValue(comps: CompProperty[]): number {
  if (comps.length === 0) return 0;

  // Use weighted average based on similarity scores
  let totalWeight = 0;
  let weightedSum = 0;

  for (const comp of comps) {
    const weight = comp.similarityScore;
    totalWeight += weight;
    weightedSum += comp.adjustedPrice * weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate value range from comparables
 */
function calculateValueRange(comps: CompProperty[]): ValueRange {
  if (comps.length === 0) {
    return { low: 0, high: 0, recommended: 0 };
  }

  const prices = comps.map(c => c.adjustedPrice).sort((a, b) => a - b);
  
  // Remove lowest and highest if we have enough comps
  let filteredPrices = prices;
  if (prices.length >= 5) {
    filteredPrices = prices.slice(1, -1);
  }

  const low = Math.min(...filteredPrices);
  const high = Math.max(...filteredPrices);
  
  // Recommended is the weighted average
  const recommended = calculateEstimatedValue(comps);

  return {
    low: Math.round(low),
    high: Math.round(high),
    recommended: Math.round(recommended),
  };
}

/**
 * Calculate price per square foot
 */
function calculatePricePerSqft(value: number, squareFeet: number): number {
  if (squareFeet === 0) return 0;
  return Math.round((value / squareFeet) * 100) / 100;
}

/**
 * Calculate confidence score (0-100)
 */
function calculateConfidenceScore(
  comps: CompProperty[],
  config: CMAConfig
): number {
  if (comps.length === 0) return 0;

  let score = 50; // Base score

  // Factor 1: Number of comparables
  if (comps.length >= 5) score += 15;
  else if (comps.length >= 3) score += 10;

  // Factor 2: Average similarity score
  const avgSimilarity = comps.reduce((sum, c) => sum + c.similarityScore, 0) / comps.length;
  score += avgSimilarity * 20;

  // Factor 3: Recency of sales
  const avgDays = comps.reduce((sum, c) => {
    const days = Math.floor(
      (Date.now() - new Date(c.soldDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0) / comps.length;
  
  if (avgDays <= 30) score += 10;
  else if (avgDays <= 60) score += 5;
  else if (avgDays > 90) score -= 10;

  // Factor 4: Distance
  const avgDistance = comps.reduce((sum, c) => sum + c.distance, 0) / comps.length;
  if (avgDistance <= 0.25) score += 5;
  else if (avgDistance > 1) score -= 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate days on market estimate
 */
function calculateDaysOnMarketEstimate(comps: CompProperty[]): number {
  if (comps.length === 0) return 0;

  const avgDays = comps.reduce((sum, c) => sum + c.daysOnMarket, 0) / comps.length;
  return Math.round(avgDays);
}

/**
 * Generate market trends from comparables
 */
function generateMarketTrends(comps: CompProperty[]): MarketTrend[] {
  if (comps.length === 0) return [];

  // Group sales by month
  const monthlyData = new Map<string, { prices: number[]; days: number[] }>();

  for (const comp of comps) {
    const date = new Date(comp.soldDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(key)) {
      monthlyData.set(key, { prices: [], days: [] });
    }
    
    const data = monthlyData.get(key)!;
    data.prices.push(comp.soldPrice);
    data.days.push(comp.daysOnMarket);
  }

  const trends: MarketTrend[] = [];
  const sortedMonths = Array.from(monthlyData.keys()).sort();

  for (let i = 0; i < sortedMonths.length; i++) {
    const month = sortedMonths[i];
    const data = monthlyData.get(month)!;
    
    const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    const avgDays = data.days.reduce((a, b) => a + b, 0) / data.days.length;
    
    // Calculate price change vs previous month
    let priceChangePercent = 0;
    if (i > 0) {
      const prevMonth = sortedMonths[i - 1];
      const prevData = monthlyData.get(prevMonth)!;
      const prevAvgPrice = prevData.prices.reduce((a, b) => a + b, 0) / prevData.prices.length;
      priceChangePercent = ((avgPrice - prevAvgPrice) / prevAvgPrice) * 100;
    }

    // Determine inventory level based on days on market
    let inventoryLevel: 'low' | 'balanced' | 'high' = 'balanced';
    if (avgDays < 20) inventoryLevel = 'low';
    else if (avgDays > 60) inventoryLevel = 'high';

    trends.push({
      period: month,
      avgSalePrice: Math.round(avgPrice),
      pricePerSqft: 0, // Would need square footage data
      avgDaysOnMarket: Math.round(avgDays),
      totalSales: data.prices.length,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      inventoryLevel,
    });
  }

  return trends;
}

/**
 * Generate a CMA report
 */
export async function generateCMA(
  subject: Property,
  listings: PropertyListing[],
  request: CMARequest,
  merchantId: string,
  agentId?: string
): Promise<CMAResponse> {
  const startTime = Date.now();

  // Merge default config with request config
  const config: CMAConfig = {
    ...DEFAULT_CMA_CONFIG,
    ...request.config,
  };

  // Step 1: Fetch comparables from all sources
  const allComps = await fetchAllComparables(subject, listings, config);

  // Step 2: Filter comparables
  let filteredComps = allComps;
  filteredComps = filterByDistance(filteredComps, config.compRadius);
  filteredComps = filterByTimeframe(filteredComps, config.compTimeframe);

  // Step 3: Validate we have enough comparables
  const validation = validateComparablePool(filteredComps, config.minComps);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  // Step 4: Calculate similarity scores
  filteredComps = filteredComps.map(comp => ({
    ...comp,
    similarityScore: calculateSimilarityScore(subject, comp),
  }));

  // Step 5: Rank and select best comparables
  const rankedComps = rankComparables(filteredComps, subject);
  const selectedComps = selectBestComparables(
    rankedComps,
    config.minComps,
    config.maxComps
  );

  // Step 6: Calculate adjustments for each comparable
  const compsWithAdjustments: CompProperty[] = selectedComps.map(comp => {
    const adjustments = calculateAdjustments(subject, comp, config.adjustmentFactors);
    const adjustedPrice = calculateAdjustedPrice(comp.soldPrice, adjustments);
    
    return {
      ...comp,
      adjustments,
      adjustedPrice,
    };
  });

  // Step 7: Validate adjustments
  for (const comp of compsWithAdjustments) {
    const validation = validateAdjustments(comp.soldPrice, comp.adjustments);
    if (!validation.valid) {
      console.warn(`Warning for comp ${comp.id}: ${validation.message}`);
    }
  }

  // Step 8: Calculate final values
  const estimatedValue = calculateEstimatedValue(compsWithAdjustments);
  const valueRange = calculateValueRange(compsWithAdjustments);
  const pricePerSqft = calculatePricePerSqft(estimatedValue, subject.features.squareFeet);
  const confidenceScore = calculateConfidenceScore(compsWithAdjustments, config);
  const daysOnMarketEstimate = calculateDaysOnMarketEstimate(compsWithAdjustments);
  const marketTrends = generateMarketTrends(compsWithAdjustments);
  const adjustmentSummary = calculateAdjustmentSummary(
    compsWithAdjustments.flatMap(c => c.adjustments)
  );

  // Step 9: Create the report
  const report: CMAReport = {
    id: `cma-${Date.now()}`,
    merchantId,
    agentId,
    subjectProperty: subject,
    estimatedValue,
    valueRange,
    pricePerSqft,
    comparableProperties: compsWithAdjustments,
    adjustments: adjustmentSummary,
    marketTrends,
    daysOnMarketEstimate,
    confidenceScore,
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    notes: request.notes,
  };

  const processingTime = Date.now() - startTime;

  return {
    report,
    processingTime,
  };
}

/**
 * Quick CMA generation with minimal inputs
 */
export async function generateQuickCMA(
  subject: Property,
  listings: PropertyListing[],
  merchantId: string,
  agentId?: string
): Promise<CMAResponse> {
  return generateCMA(
    subject,
    listings,
    { propertyId: subject.id },
    merchantId,
    agentId
  );
}

/**
 * Validate CMA inputs
 */
export function validateCMARequest(
  request: CMARequest,
  subject: Property
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!subject) {
    errors.push('Subject property is required');
  } else {
    if (!subject.features.squareFeet || subject.features.squareFeet <= 0) {
      errors.push('Subject property must have valid square footage');
    }
    if (!subject.features.bedrooms || subject.features.bedrooms < 0) {
      errors.push('Subject property must have valid bedroom count');
    }
    if (!subject.features.bathrooms || subject.features.bathrooms < 0) {
      errors.push('Subject property must have valid bathroom count');
    }
  }

  if (request.config) {
    if (request.config.compRadius && request.config.compRadius > 5) {
      errors.push('Comparison radius should not exceed 5 miles');
    }
    if (request.config.compTimeframe && request.config.compTimeframe > 365) {
      errors.push('Comparison timeframe should not exceed 1 year');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
