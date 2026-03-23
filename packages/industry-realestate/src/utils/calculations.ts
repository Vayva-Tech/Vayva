// @ts-nocheck
/**
 * Real Estate Calculations
 * Utility functions for real estate calculations
 */

/**
 * Calculate mortgage payment
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/**
 * Calculate loan-to-value ratio
 */
export function calculateLTV(loanAmount: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return Math.round((loanAmount / propertyValue) * 10000) / 100;
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDTI(
  monthlyDebtPayments: number,
  grossMonthlyIncome: number
): number {
  if (grossMonthlyIncome === 0) return 0;
  return Math.round((monthlyDebtPayments / grossMonthlyIncome) * 10000) / 100;
}

/**
 * Calculate cap rate
 */
export function calculateCapRate(
  netOperatingIncome: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;
  return Math.round((netOperatingIncome / propertyValue) * 10000) / 100;
}

/**
 * Calculate cash-on-cash return
 */
export function calculateCashOnCashReturn(
  annualCashFlow: number,
  totalCashInvested: number
): number {
  if (totalCashInvested === 0) return 0;
  return Math.round((annualCashFlow / totalCashInvested) * 10000) / 100;
}

/**
 * Calculate gross rent multiplier
 */
export function calculateGRM(
  propertyValue: number,
  annualGrossRent: number
): number {
  if (annualGrossRent === 0) return 0;
  return Math.round((propertyValue / annualGrossRent) * 100) / 100;
}

/**
 * Calculate price per square foot
 */
export function calculatePricePerSqft(
  price: number,
  squareFeet: number
): number {
  if (squareFeet === 0) return 0;
  return Math.round((price / squareFeet) * 100) / 100;
}

/**
 * Calculate commission
 */
export function calculateCommission(
  salePrice: number,
  commissionRate: number
): number {
  return Math.round(salePrice * (commissionRate / 100));
}

/**
 * Calculate net proceeds from sale
 */
export function calculateNetProceeds(
  salePrice: number,
  commissionRate: number,
  closingCosts: number = 0,
  existingMortgage: number = 0
): number {
  const commission = calculateCommission(salePrice, commissionRate);
  return salePrice - commission - closingCosts - existingMortgage;
}

/**
 * Calculate appreciation
 */
export function calculateAppreciation(
  originalValue: number,
  currentValue: number
): { amount: number; percent: number } {
  const amount = currentValue - originalValue;
  const percent = originalValue === 0 ? 0 : (amount / originalValue) * 100;
  
  return {
    amount: Math.round(amount),
    percent: Math.round(percent * 100) / 100,
  };
}

/**
 * Calculate ROI
 */
export function calculateROI(
  gain: number,
  cost: number
): number {
  if (cost === 0) return 0;
  return Math.round((gain / cost) * 10000) / 100;
}
