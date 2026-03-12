/**
 * Financing Calculator Component
 * Interactive tool for calculating auto loan payments
 */

import React, { useState, useEffect } from 'react';

interface FinancingCalculatorProps {
  vehiclePrice?: number;
  onCalculateComplete?: (result: CalculationResult) => void;
}

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  apr: number;
  termMonths: number;
}

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  vehiclePrice = 35000,
  onCalculateComplete,
}) => {
  const [price, setPrice] = useState(vehiclePrice);
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [interestRate, setInterestRate] = useState(5.9);
  const [loanTerm, setLoanTerm] = useState(60);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    calculatePayment();
  }, [price, downPayment, tradeInValue, interestRate, loanTerm]);

  const calculatePayment = () => {
    const loanAmount = price - downPayment - tradeInValue;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;

    // Monthly payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    const calculationResult = {
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      totalPayment: isNaN(totalPayment) ? 0 : totalPayment,
      apr: interestRate,
      termMonths: loanTerm,
    };

    setResult(calculationResult);
    onCalculateComplete?.(calculationResult);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Financing Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Vehicle Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Down Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment
            </label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trade-In Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trade-In Value
            </label>
            <input
              type="number"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Loan Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (months)
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={36}>36 months</option>
              <option value={48}>48 months</option>
              <option value={60}>60 months</option>
              <option value={72}>72 months</option>
              <option value={84}>84 months</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Payment Breakdown</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Loan Amount:</span>
              <span className="font-semibold">{formatCurrency(price - downPayment - tradeInValue)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="text-2xl font-bold text-blue-600">
                {result ? formatCurrency(result.monthlyPayment) : '$0.00'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-semibold">
                {result ? formatCurrency(result.totalInterest) : '$0.00'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Total Payment:</span>
              <span className="text-xl font-bold">
                {result ? formatCurrency(result.totalPayment) : '$0.00'}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-4 mt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Terms:</p>
            <div className="flex flex-wrap gap-2">
              {[36, 48, 60, 72].map(term => (
                <button
                  key={term}
                  onClick={() => setLoanTerm(term)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    loanTerm === term
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {term} mo
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-500">
        * This calculator provides estimates only. Actual payments may vary based on credit score, 
        lender terms, and other factors. Contact us for personalized financing options.
      </p>
    </div>
  );
};
