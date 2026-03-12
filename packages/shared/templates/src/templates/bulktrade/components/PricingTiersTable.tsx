import React from "react";

interface PricingTier {
  minQty: number;
  price: number;
}

interface PricingTiersTableProps {
  tiers: PricingTier[];
  currentQty: number;
}

export const PricingTiersTable = ({
  tiers,
  currentQty,
}: PricingTiersTableProps) => {
  // Sort tiers by qty
  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <div className="w-full text-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="text-gray-500 font-bold text-xs uppercase border-b border-gray-200 pb-2">
          Quantity
        </div>
        <div className="text-gray-500 font-bold text-xs uppercase border-b border-gray-200 pb-2 text-right">
          Unit Price
        </div>

        {sortedTiers.map((tier, idx) => {
          // Check if this is the active tier
          const nextTier = sortedTiers[idx + 1];
          const isActive =
            currentQty >= tier.minQty &&
            (!nextTier || currentQty < nextTier.minQty);

          return (
            <React.Fragment key={idx}>
              <div
                className={`py-1 font-medium ${isActive ? "text-blue-600 font-bold" : "text-gray-700"}`}
              >
                {tier.minQty}
                {nextTier ? ` - ${nextTier.minQty - 1}` : "+"}
              </div>
              <div
                className={`py-1 text-right font-medium ${isActive ? "text-blue-600 font-bold" : "text-gray-900"}`}
              >
                ₦{tier.price.toLocaleString()}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Savings Indicator */}
      {currentQty >= sortedTiers[0].minQty && (
        <div className="mt-3 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block">
          Active Tier Applied
        </div>
      )}
    </div>
  );
};
