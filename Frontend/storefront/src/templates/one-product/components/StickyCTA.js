import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@vayva/ui";
export const StickyCTA = ({ price, onBuy }) => {
    return (_jsxs("div", { className: "fixed bottom-0 left-0 w-full bg-background/70 backdrop-blur-xl border-t border-gray-200 p-4 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 safe-area-bottom", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs text-gray-500 uppercase font-bold block", children: "Total" }), _jsxs("span", { className: "text-xl font-black text-gray-900", children: ["\u20A6", price.toLocaleString()] })] }), _jsx(Button, { onClick: onBuy, className: "flex-1 bg-[#111827] text-white font-bold py-3 rounded-xl shadow-lg h-auto", "aria-label": `Buy now for ₦${price.toLocaleString()}`, children: "Buy Now" })] }));
};
