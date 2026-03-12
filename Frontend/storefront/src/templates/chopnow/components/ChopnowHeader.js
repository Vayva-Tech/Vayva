import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Button } from "@vayva/ui";
export const ChopnowHeader = () => {
    const { cart } = useStore();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    return (_jsxs("header", { className: "sticky top-0 z-50 bg-background/70 backdrop-blur-xl shadow-sm", children: [_jsxs("div", { className: "max-w-md mx-auto px-4 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] uppercase text-gray-400 font-bold tracking-wider", children: "Delivering to" }), _jsxs(Button, { variant: "ghost", className: "flex items-center gap-1 text-red-600 font-bold text-sm h-auto p-1", "aria-label": "Change delivery location", children: [_jsx(MapPin, { size: 14 }), _jsx("span", { className: "truncate max-w-[150px]", children: "Lekki Phase 1, Lagos" }), _jsx("span", { className: "text-xs text-gray-400", children: "\u25BC" })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Link, { href: "/cart", className: "relative p-2 text-gray-700 hover:text-red-600", children: [_jsx(ShoppingBag, { size: 24 }), cartCount > 0 && (_jsx("span", { className: "absolute top-1 right-0 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center", children: cartCount }))] }) })] }), _jsxs("div", { className: "border-t border-gray-100 flex text-sm font-bold text-center", children: [_jsx(Button, { variant: "ghost", className: "flex-1 py-3 text-red-600 border-b-2 border-red-600 bg-red-50 h-auto rounded-none", "aria-label": "Delivery", children: "Delivery" }), _jsx(Button, { variant: "ghost", className: "flex-1 py-3 text-gray-400 hover:text-gray-600 h-auto rounded-none", "aria-label": "Pickup", children: "Pickup" })] })] }));
};
