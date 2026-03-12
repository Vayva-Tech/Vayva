import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";
export const MobileHeader = ({ storeName = "GIZMO TECH", cartItemCount = 0, }) => {
    return (_jsxs("header", { className: "sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-gray-200 h-[60px] flex items-center justify-between px-4 shadow-sm", children: [_jsx("div", { className: "flex items-center gap-3 ring-offset-2", children: _jsx(Link, { href: "/", className: "font-bold text-xl tracking-tighter uppercase text-[#0B0F19]", children: storeName }) }), _jsxs("div", { className: "flex items-center gap-5 text-[#0B0F19]", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "p-1 hover:text-blue-600 transition-colors h-auto", "aria-label": "Search", children: _jsx(Search, { size: 20, strokeWidth: 2 }) }), _jsxs(Link, { href: "/cart", className: "relative p-1 hover:text-blue-600 transition-colors", children: [_jsx(ShoppingBag, { size: 20, strokeWidth: 2 }), cartItemCount > 0 && (_jsx("span", { className: "absolute -top-1.5 -right-1.5 bg-[#3B82F6] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm", children: cartItemCount }))] })] })] }));
};
