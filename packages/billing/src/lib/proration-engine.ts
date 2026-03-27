/**
 * Proration Calculation Engine
 * 
 * Handles complex proration calculations for subscription changes including:
 * - Mid-cycle upgrades/downgrades
 * - Plan changes with different billing cycles
 * - Credit carry-over and application
 * - Partial month calculations
 * 
 * @module ProrationEngine
 */

export interface ProrationInput {
  /** Current plan key (e.g., "PRO", "STARTER") */
  currentPlan: string;
  /** Target plan key */
  targetPlan: string;
  /** Current plan monthly amount in NGN */
  currentAmount: number;
  /** Target plan monthly amount in NGN */
  targetAmount: number;
  /** Billing cycle start date */
  cycleStartDate: Date;
  /** Billing cycle end date */
  cycleEndDate: Date;
  /** Change effective date */
  effectiveDate: Date;
  /** Whether this is an upgrade (true) or downgrade (false) */
  isUpgrade: boolean;
  /** Any existing credits to apply */
  existingCredits?: number;
  /** Billing cycle type */
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
}

export interface ProrationResult {
  /** Number of days remaining in billing cycle */
  daysRemaining: number;
  /** Total days in billing cycle */
  totalDays: number;
  /** Daily rate of current plan */
  dailyRateCurrent: number;
  /** Daily rate of target plan */
  dailyRateTarget: number;
  /** Proration credit (positive = customer gets credit, negative = customer owes) */
  prorationCredit: number;
  /** Existing credits applied */
  creditsApplied: number;
  /** Total credit after calculations */
  totalCredit: number;
  /** Amount due immediately (if upgrading) */
  amountDueNow: number;
  /** Next billing amount */
  nextBillingAmount: number;
  /** Breakdown of calculations for display */
  breakdown: {
    unusedCurrentPlan: number;
    costOfTargetPlan: number;
    difference: number;
    creditsUsed: number;
  };
  /** Effective date of change */
  effectiveDate: Date;
  /** Next billing date */
  nextBillingDate: Date;
}

export interface CreditCarryoverConfig {
  /** Maximum months credits can be carried over */
  maxCarryoverMonths: number;
  /** Whether credits expire on downgrade */
  expireOnDowngrade: boolean;
  /** Percentage of credits retained on downgrade */
  downgradeRetentionRate: number;
}

// Default configuration
const DEFAULT_CARRYOVER_CONFIG: CreditCarryoverConfig = {
  maxCarryoverMonths: 12,
  expireOnDowngrade: false,
  downgradeRetentionRate: 1.0, // 100% retained
};

const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  STARTER: 25000,
  PRO: 35000,
  PRO_PLUS: 50000,
};

/**
 * Calculate proration for subscription changes
 * 
 * Formula:
 * Proration Credit = (Unused Current Plan Value) - (Cost of Target Plan for Remaining Days)
 * 
 * Where:
 * - Unused Current Plan Value = Daily Rate Current × Days Remaining
 * - Cost of Target Plan for Remaining Days = Daily Rate Target × Days Remaining
 * 
 * If proration credit is positive: Customer gets credit applied to next invoice
 * If proration credit is negative: Customer owes the difference immediately
 */
export function calculateProration(input: ProrationInput): ProrationResult {
  const {
    currentAmount,
    targetAmount,
    cycleStartDate,
    cycleEndDate,
    effectiveDate,
    existingCredits = 0,
  } = input;

  // Calculate days
  const totalDays = Math.ceil((cycleEndDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((cycleEndDate.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate daily rates
  const dailyRateCurrent = currentAmount / totalDays;
  const dailyRateTarget = targetAmount / totalDays;

  // Calculate unused value of current plan
  const unusedCurrentPlan = dailyRateCurrent * daysRemaining;

  // Calculate cost of target plan for remaining days
  const costOfTargetPlan = dailyRateTarget * daysRemaining;

  // Calculate proration difference
  const difference = unusedCurrentPlan - costOfTargetPlan;

  // Determine credits to apply
  let creditsUsed = 0;
  if (difference < 0 && existingCredits > 0) {
    // Customer owes money, use credits to offset
    creditsUsed = Math.min(Math.abs(difference), existingCredits);
  }

  // Calculate final proration credit
  const prorationCredit = difference + creditsUsed;

  // Calculate amount due now (if upgrading and proration is negative)
  const amountDueNow = prorationCredit < 0 ? Math.abs(prorationCredit) : 0;

  // Calculate next billing amount
  const nextBillingAmount = targetAmount;

  // Calculate total credit after this cycle
  const totalCredit = existingCredits - creditsUsed + (prorationCredit > 0 ? prorationCredit : 0);

  return {
    daysRemaining,
    totalDays,
    dailyRateCurrent: Math.round(dailyRateCurrent * 100) / 100,
    dailyRateTarget: Math.round(dailyRateTarget * 100) / 100,
    prorationCredit: Math.round(prorationCredit),
    creditsApplied: creditsUsed,
    totalCredit: Math.round(totalCredit),
    amountDueNow: Math.round(amountDueNow),
    nextBillingAmount: Math.round(nextBillingAmount),
    breakdown: {
      unusedCurrentPlan: Math.round(unusedCurrentPlan),
      costOfTargetPlan: Math.round(costOfTargetPlan),
      difference: Math.round(difference),
      creditsUsed: creditsUsed,
    },
    effectiveDate,
    nextBillingDate: cycleEndDate,
  };
}

/**
 * Calculate credit carryover when downgrading
 * 
 * When a user downgrades, they may have unused credits. This function
 * calculates how many credits carry over based on configuration.
 */
export function calculateCreditCarryover(
  currentCredits: number,
  currentPlan: string,
  targetPlan: string,
  config: CreditCarryoverConfig = DEFAULT_CARRYOVER_CONFIG
): number {
  // If upgrading, all credits carry over
  if (PLAN_PRICES[targetPlan] >= PLAN_PRICES[currentPlan]) {
    return currentCredits;
  }

  // If downgrading, apply retention rate
  const retainedCredits = currentCredits * config.downgradeRetentionRate;
  
  // Check if credits would expire
  if (config.expireOnDowngrade) {
    return 0;
  }

  return Math.floor(retainedCredits);
}

/**
 * Handle mid-cycle billing cycle change
 * 
 * Example: Monthly → Quarterly during active cycle
 */
export interface BillingCycleChangeInput {
  currentAmount: number;
  newAmount: number;
  currentCycleStart: Date;
  currentCycleEnd: Date;
  changeDate: Date;
  newCycleLength: 'monthly' | 'quarterly' | 'annual';
}

export interface BillingCycleChangeResult {
  /** Credit from unused portion of old cycle */
  unusedCredit: number;
  /** Charge for new cycle */
  newCycleCharge: number;
  /** Net amount due/credit */
  netAmount: number;
  /** New cycle end date */
  newCycleEnd: Date;
}

export function handleBillingCycleChange(input: BillingCycleChangeInput): BillingCycleChangeResult {
  const {
    currentAmount,
    newAmount,
    currentCycleStart,
    currentCycleEnd,
    changeDate,
    newCycleLength,
  } = input;

  // Calculate unused portion of current cycle
  const totalDays = Math.ceil((currentCycleEnd.getTime() - currentCycleStart.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, Math.ceil((currentCycleEnd.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24)));
  const unusedCredit = (currentAmount / totalDays) * remainingDays;

  // Calculate new cycle length in days
  let newCycleDays: number;
  switch (newCycleLength) {
    case 'monthly':
      newCycleDays = 30;
      break;
    case 'quarterly':
      newCycleDays = 90;
      break;
    case 'annual':
      newCycleDays = 365;
      break;
  }

  // Calculate new cycle end date
  const newCycleEnd = new Date(changeDate);
  newCycleEnd.setDate(newCycleEnd.getDate() + newCycleDays);

  // Calculate new cycle charge
  const newCycleCharge = newAmount;

  // Calculate net amount
  const netAmount = newCycleCharge - unusedCredit;

  return {
    unusedCredit: Math.round(unusedCredit),
    newCycleCharge,
    netAmount: Math.round(netAmount),
    newCycleEnd,
  };
}

/**
 * Generate proration invoice line items
 */
export interface InvoiceLineItem {
  description: string;
  amount: number;
  type: 'charge' | 'credit';
}

export function generateProrationLineItems(result: ProrationInput & ProrationResult): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];

  // Show unused current plan credit
  if (result.breakdown.unusedCurrentPlan > 0) {
    items.push({
      description: `Unused ${result.currentPlan} plan (${result.daysRemaining} days)`,
      amount: result.breakdown.unusedCurrentPlan,
      type: 'credit',
    });
  }

  // Show cost of target plan
  if (result.breakdown.costOfTargetPlan > 0) {
    items.push({
      description: `${result.targetPlan} plan upgrade (${result.daysRemaining} days)`,
      amount: result.breakdown.costOfTargetPlan,
      type: 'charge',
    });
  }

  // Show credits applied
  if (result.creditsApplied > 0) {
    items.push({
      description: 'Credits applied',
      amount: result.creditsApplied,
      type: 'credit',
    });
  }

  // Show proration adjustment
  if (result.prorationCredit !== 0) {
    const isCredit = result.prorationCredit > 0;
    items.push({
      description: isCredit ? 'Proration credit' : 'Proration charge',
      amount: Math.abs(result.prorationCredit),
      type: isCredit ? 'credit' : 'charge',
    });
  }

  return items;
}

/**
 * Validate proration inputs
 */
export function validateProrationInput(input: ProrationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.currentPlan || !input.targetPlan) {
    errors.push('Current and target plans are required');
  }

  if (input.currentAmount < 0 || input.targetAmount < 0) {
    errors.push('Plan amounts cannot be negative');
  }

  if (isNaN(input.cycleStartDate.getTime()) || isNaN(input.cycleEndDate.getTime())) {
    errors.push('Invalid cycle dates');
  }

  if (isNaN(input.effectiveDate.getTime())) {
    errors.push('Invalid effective date');
  }

  if (input.effectiveDate < input.cycleStartDate) {
    errors.push('Effective date cannot be before cycle start');
  }

  if (input.effectiveDate > input.cycleEndDate) {
    errors.push('Effective date cannot be after cycle end');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format proration result for display
 */
export function formatProrationForDisplay(result: ProrationResult): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  let output = 'Proration Calculation:\n';
  output += '========================\n\n';
  output += `Days remaining: ${result.daysRemaining} / ${result.totalDays}\n`;
  output += `Daily rate (current): ${formatter.format(result.dailyRateCurrent)}\n`;
  output += `Daily rate (target): ${formatter.format(result.dailyRateTarget)}\n\n`;
  output += `Unused current plan: ${formatter.format(result.breakdown.unusedCurrentPlan)}\n`;
  output += `Cost of target plan: ${formatter.format(result.breakdown.costOfTargetPlan)}\n`;
  output += `Difference: ${formatter.format(result.breakdown.difference)}\n`;
  
  if (result.creditsApplied > 0) {
    output += `Credits applied: ${formatter.format(result.creditsApplied)}\n`;
  }
  
  output += `\n`;
  
  if (result.prorationCredit > 0) {
    output += `✅ Credit to your account: ${formatter.format(result.prorationCredit)}\n`;
  } else if (result.prorationCredit < 0) {
    output += `💳 Amount due now: ${formatter.format(Math.abs(result.prorationCredit))}\n`;
  } else {
    output += `✓ No proration charge (perfect timing!)\n`;
  }

  if (result.totalCredit > 0) {
    output += `\nTotal credits after change: ${formatter.format(result.totalCredit)}\n`;
  }

  return output;
}

/**
 * Export for use in API routes and workers
 */
export const ProrationEngine = {
  calculateProration,
  calculateCreditCarryover,
  handleBillingCycleChange,
  generateProrationLineItems,
  validateProrationInput,
  formatProrationForDisplay,
  DEFAULT_CARRYOVER_CONFIG,
};
