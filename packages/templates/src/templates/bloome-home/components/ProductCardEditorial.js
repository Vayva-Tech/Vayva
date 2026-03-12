import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import Link from "next/link";
export const ProductCardEditorial = ({ product, storeSlug = "#", }) => {
    // Determine badge content
    let badge = null;
    if (product.subscriptionOptions?.available) {
        badge = "Subscribe";
    }
    else if (!product.inStock) {
        badge = "Sold Out";
    }
    return (_jsxs(Link, { href: `/product/${product.id}?store=${storeSlug}`, className: "group block text-center", children: [_jsxs("div", { className: "relative aspect-[3/4] bg-[#F5F5F0] overflow-hidden mb-4", children: [_jsx(Image, { src: product.images[0], alt: product.name, fill: true, className: "object-cover group-hover:scale-105 transition-transform duration-700 ease-out" }), badge && (_jsx("div", { className: "absolute top-4 left-4 bg-background/70 backdrop-blur-xl px-2 py-1 text-[10px] uppercase tracking-wider text-[#2E2E2E]", children: badge }))] }), _jsxs("div", { className: "space-y-2 px-2", children: [_jsx("h3", { className: "font-serif text-lg text-[#2E2E2E] group-hover:text-[#C9B7A2] transition-colors duration-300", children: product.name }), product.ingredients && (_jsx("p", { className: "text-[10px] text-gray-400 uppercase tracking-widest truncate max-w-[200px] mx-auto", children: product.ingredients.split(",")[0] })), _jsxs("p", { className: "font-medium text-[#2E2E2E] text-sm", children: ["\u20A6", product.price.toLocaleString()] })] })] }));
};
