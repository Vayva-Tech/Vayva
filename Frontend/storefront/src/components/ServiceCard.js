import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import NextLink from "next/link";
const Link = NextLink;
import { Clock } from "lucide-react";
export function ServiceCard({ product, storeSlug }) {
    const metadata = product.metadata;
    return (_jsxs("div", { className: "border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-gray-900", children: product.name }), metadata?.durationMinutes && (_jsxs("div", { className: "flex items-center gap-1 text-sm text-gray-500 mt-1", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: [metadata.durationMinutes, " mins"] })] }))] }), _jsxs("span", { className: "font-bold text-lg", children: ["\u20A6", product.price.toLocaleString()] })] }), _jsx("p", { className: "text-gray-600 text-sm mb-6 line-clamp-3", children: product.description }), _jsx(Link, { href: `/products/${product.id}?store=${storeSlug}`, className: "block w-full text-center bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors", children: "Book Appointment" })] }));
}
