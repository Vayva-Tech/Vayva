import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export const PricingTiersTable = ({ tiers, currentQty, }) => {
    // Sort tiers by qty
    const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);
    return (_jsxs("div", { className: "w-full text-sm", children: [_jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2", children: [_jsx("div", { className: "text-gray-500 font-bold text-xs uppercase border-b border-gray-200 pb-2", children: "Quantity" }), _jsx("div", { className: "text-gray-500 font-bold text-xs uppercase border-b border-gray-200 pb-2 text-right", children: "Unit Price" }), sortedTiers.map((tier, idx) => {
                        // Check if this is the active tier
                        const nextTier = sortedTiers[idx + 1];
                        const isActive = currentQty >= tier.minQty &&
                            (!nextTier || currentQty < nextTier.minQty);
                        return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: `py-1 font-medium ${isActive ? "text-blue-600 font-bold" : "text-gray-700"}`, children: [tier.minQty, nextTier ? ` - ${nextTier.minQty - 1}` : "+"] }), _jsxs("div", { className: `py-1 text-right font-medium ${isActive ? "text-blue-600 font-bold" : "text-gray-900"}`, children: ["\u20A6", tier.price.toLocaleString()] })] }, idx));
                    })] }), currentQty >= sortedTiers[0].minQty && (_jsx("div", { className: "mt-3 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block", children: "Active Tier Applied" }))] }));
};
