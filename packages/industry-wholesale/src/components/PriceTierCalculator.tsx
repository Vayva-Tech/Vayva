// @ts-nocheck
'use client';
/**
 * Price Tier Calculator Component
 */

import React, { useState } from 'react';

interface TieredPriceResult {
  finalPrice: number;
  appliedDiscount: number;
  tierName: string;
  savings: number;
}

interface PriceTierCalculatorProps {
  productId?: string;
  basePrice?: number;
  tiers?: Array<{
    name: string;
    minQuantity: number;
    discountPercentage: number;
  }>;
  onCalculateComplete?: (result: any) => void;
}

export const PriceTierCalculator: React.FC<PriceTierCalculatorProps> = ({
  productId = 'prod_1',
  basePrice = 25.00,
  tiers = [
    { name: 'Retail', minQuantity: 1, discountPercentage: 0 },
    { name: 'Bronze', minQuantity: 10, discountPercentage: 5 },
    { name: 'Silver', minQuantity: 50, discountPercentage: 10 },
    { name: 'Gold', minQuantity: 100, discountPercentage: 20 },
  ],
  onCalculateComplete,
}) => {
  const [quantity, setQuantity] = useState(50);
  const [result, setResult] = useState<TieredPriceResult | null>(null);

  const calculatePrice = () => {
    let bestTier = tiers[0];
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity && tier.discountPercentage > bestTier.discountPercentage) {
        bestTier = tier;
      }
    }

    const baseTotal = basePrice * quantity;
    const discountAmount = baseTotal * (bestTier.discountPercentage / 100);
    const finalPrice = baseTotal - discountAmount;

    const calcResult: TieredPriceResult = {
      finalPrice: Math.round(finalPrice * 100) / 100,
      appliedDiscount: bestTier.discountPercentage,
      tierName: bestTier.name,
      savings: Math.round(discountAmount * 100) / 100,
    };

    setResult(calcResult);
    onCalculateComplete?.(calcResult);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Wholesale Price Calculator</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        <button
          onClick={calculatePrice}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Calculate Price
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Base Price</p>
                <p className="text-lg font-semibold">${(basePrice * quantity).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Discount ({result.appliedDiscount}%)</p>
                <p className="text-lg font-semibold text-green-600">-${result.savings.toFixed(2)}</p>
              </div>
              <div className="col-span-2 pt-3 border-t border-green-200">
                <p className="text-sm text-gray-600">Final Price</p>
                <p className="text-2xl font-bold text-green-700">${result.finalPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Tier: {result.tierName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tier Display */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Available Tiers</h4>
          <div className="space-y-2">
            {tiers.map((tier, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{tier.name}</span>
                <span className="text-sm text-gray-600">
                  {tier.minQuantity}+ units → {tier.discountPercentage}% OFF
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
