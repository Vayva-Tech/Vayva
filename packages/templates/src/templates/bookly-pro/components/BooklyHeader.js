import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@vayva/ui";
export const BooklyHeader = ({ storeName = "PRESTIGE BARBERS", phone = "+234 800 CUTS", }) => {
    return (_jsxs("header", { className: "sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 h-[72px] shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl", children: storeName.charAt(0) }), _jsx(Link, { href: "/", className: "font-bold text-gray-900 text-lg tracking-tight", children: storeName })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("a", { href: `tel:${phone}`, className: "hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors", children: [_jsx(Phone, { size: 18 }), _jsx("span", { children: phone })] }), _jsx(Button, { className: "bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 h-auto", "aria-label": "Book Now", children: "Book Now" })] })] }));
};
