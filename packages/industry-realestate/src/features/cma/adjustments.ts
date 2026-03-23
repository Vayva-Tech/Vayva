// @ts-nocheck
/**
 * CMA Adjustment Engine
 * Calculates adjustments for comparable properties
 */

import type { Adjustment, AdjustmentFactor, CompProperty, Property } from '../../types';

export interface AdjustmentCalculation {
  feature: string;
  subjectValue: number;
  compValue: number;
  difference: number;
  unitValue: number;
  amount: number;
}

/**
 * Calculate adjustment for a specific feature
 */
export function calculateFeatureAdjustment(
  feature: string,
  subjectValue: number,
  compValue: number,
  unitValue: number,
  unit: 'sqft' | 'bedroom' | 'bathroom' | 'lot_sqft' | 'year' | 'fixed'
): Adjustment {
  const difference = subjectValue - compValue;
  let amount = 0;

  switch (unit) {
    case 'sqft':
    case 'lot_sqft':
      amount = difference * unitValue;
      break;
    case 'bedroom':
    case 'bathroom':
    case 'year':
      amount = difference * unitValue;
      break;
    case 'fixed':
      // For fixed adjustments, apply if comp has/doesn't have feature
      amount = difference > 0 ? unitValue : difference < 0 ? -unitValue : 0;
      break;
  }

  return {
    feature,
    difference,
    unitValue,
    amount: Math.round(amount),
  };
}

/**
 * Calculate all adjustments for a comparable property
 */
export function calculateAdjustments(
  subject: Property,
  comp: CompProperty,
  factors: AdjustmentFactor[]
): Adjustment[] {
  const adjustments: Adjustment[] = [];

  for (const factor of factors) {
    let subjectValue: number;
    let compValue: number;

    switch (factor.feature) {
      case 'square_feet':
        subjectValue = subject.features.squareFeet;
        compValue = comp.squareFeet;
        break;
      case 'bedroom':
        subjectValue = subject.features.bedrooms;
        compValue = comp.bedrooms;
        break;
      case 'bathroom':
        subjectValue = subject.features.bathrooms;
        compValue = comp.bathrooms;
        break;
      case 'lot_size':
        subjectValue = subject.features.lotSize || 0;
        compValue = comp.lotSize || 0;
        break;
      case 'year_built':
        subjectValue = subject.features.yearBuilt || new Date().getFullYear();
        compValue = comp.yearBuilt || new Date().getFullYear();
        break;
      case 'garage':
        subjectValue = subject.features.garageSpaces || 0;
        compValue = 0; // Simplified - would need comp data
        break;
      case 'pool':
        subjectValue = subject.features.hasPool ? 1 : 0;
        compValue = 0; // Simplified - would need comp data
        break;
      default:
        continue;
    }

    const adjustment = calculateFeatureAdjustment(
      factor.feature,
      subjectValue,
      compValue,
      factor.unitValue,
      factor.unit
    );

    if (adjustment.amount !== 0) {
      adjustments.push(adjustment);
    }
  }

  return adjustments;
}

/**
 * Calculate net adjustment for a comparable
 */
export function calculateNetAdjustment(adjustments: Adjustment[]): number {
  return adjustments.reduce((sum, adj) => sum + adj.amount, 0);
}

/**
 * Calculate adjusted price for a comparable
 */
export function calculateAdjustedPrice(
  soldPrice: number,
  adjustments: Adjustment[]
): number {
  const netAdjustment = calculateNetAdjustment(adjustments);
  return soldPrice + netAdjustment;
}

/**
 * Validate that adjustments are within acceptable limits
 * Industry standard: typically 15-25% of sale price
 */
export function validateAdjustments(
  soldPrice: number,
  adjustments: Adjustment[],
  maxAdjustmentPercent: number = 20
): { valid: boolean; message?: string } {
  const netAdjustment = Math.abs(calculateNetAdjustment(adjustments));
  const adjustmentPercent = (netAdjustment / soldPrice) * 100;

  if (adjustmentPercent > maxAdjustmentPercent) {
    return {
      valid: false,
      message: `Net adjustment (${adjustmentPercent.toFixed(1)}%) exceeds ${maxAdjustmentPercent}% limit`,
    };
  }

  // Check individual adjustments
  for (const adj of adjustments) {
    const individualPercent = (Math.abs(adj.amount) / soldPrice) * 100;
    if (individualPercent > 10) {
      return {
        valid: false,
        message: `Individual adjustment for ${adj.feature} (${individualPercent.toFixed(1)}%) exceeds 10% limit`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate similarity score between subject and comparable
 * Returns score between 0 and 1
 */
export function calculateSimilarityScore(
  subject: Property,
  comp: CompProperty
): number {
  let score = 1.0;
  let factors = 0;

  // Square footage similarity (within 10% is ideal)
  const sqftDiff = Math.abs(subject.features.squareFeet - comp.squareFeet) / subject.features.squareFeet;
  score *= Math.max(0.5, 1 - sqftDiff * 2);
  factors++;

  // Bedroom similarity
  const bedroomDiff = Math.abs(subject.features.bedrooms - comp.bedrooms);
  score *= Math.max(0.7, 1 - bedroomDiff * 0.15);
  factors++;

  // Bathroom similarity
  const bathroomDiff = Math.abs(subject.features.bathrooms - comp.bathrooms);
  score *= Math.max(0.7, 1 - bathroomDiff * 0.1);
  factors++;

  // Year built similarity (if available)
  if (subject.features.yearBuilt && comp.yearBuilt) {
    const yearDiff = Math.abs(subject.features.yearBuilt - comp.yearBuilt);
    score *= Math.max(0.7, 1 - yearDiff * 0.01);
    factors++;
  }

  // Distance penalty
  score *= Math.max(0.5, 1 - comp.distance * 0.1);
  factors++;

  // Age of sale penalty (older sales are less similar)
  const daysSinceSale = Math.floor(
    (Date.now() - new Date(comp.soldDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  score *= Math.max(0.6, 1 - daysSinceSale * 0.002);
  factors++;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate adjustment summary statistics
 */
export function calculateAdjustmentSummary(adjustments: Adjustment[]) {
  const totalAdjustments = adjustments.length;
  const netAdjustment = calculateNetAdjustment(adjustments);
  const avgAdjustment = totalAdjustments > 0 ? netAdjustment / totalAdjustments : 0;
  const largestAdjustment = adjustments.length > 0 
    ? Math.max(...adjustments.map(a => Math.abs(a.amount)))
    : 0;

  return {
    totalAdjustments,
    netAdjustment,
    avgAdjustmentPerComp: Math.round(avgAdjustment),
    largestAdjustment,
  };
}
