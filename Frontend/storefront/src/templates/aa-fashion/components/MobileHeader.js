import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";
export const MobileHeader = ({ storeName, cartItemCount = 0, }) => {
    return (_jsxs("header", { className: "sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-gray-100 h-[60px] flex items-center justify-between px-4", children: [_jsx(Link, { href: "/", className: "font-bold text-lg tracking-tight uppercase text-[#111111]", children: storeName }), _jsxs("div", { className: "flex items-center gap-4 text-[#111111]", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "p-1 h-auto", "aria-label": "Search", children: _jsx(Search, { size: 22, strokeWidth: 1.5 }) }), _jsxs(Link, { href: "/cart", className: "relative p-1", children: [_jsx(ShoppingBag, { size: 22, strokeWidth: 1.5 }), cartItemCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-[#111111] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center", children: cartItemCount }))] })] })] }));
};
