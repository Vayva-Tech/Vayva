import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import NextLink from "next/link";
const Link = NextLink;
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { FoodProductCard } from "./FoodProductCard";
import { ServiceCard } from "./ServiceCard";
export function ProductCard({ product, storeSlug }) {
    const { store } = useStore();
    const industry = store?.industry || "RETAIL"; // Default to retail
    // Variant Routing
    if (industry.startsWith("FOOD") || industry === "RESTAURANT") {
        return _jsx(FoodProductCard, { product: product, storeSlug: storeSlug });
    }
    if (industry === "SERVICES" || industry === "BEAUTY" || industry === "CLINIC") {
        return _jsx(ServiceCard, { product: product, storeSlug: storeSlug });
    }
    // Standard Retail Card
    return (_jsxs(Link, { href: `/products/${product.id}?store=${storeSlug}`, className: "group block", children: [_jsxs("div", { className: "relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4", children: [product.images[0] ? (_jsx(Image, { src: product.images[0], alt: product.name, fill: true, sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw", className: "object-cover group-hover:scale-105 transition-transform duration-500" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-300", children: "No Image" })), !product.inStock && (_jsx("div", { className: "absolute top-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm", children: "Sold Out" }))] }), _jsx("h3", { className: "font-medium text-sm group-hover:text-gray-600 transition-colors", children: product.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("span", { className: "font-bold text-sm", children: ["\u20A6", product.price.toLocaleString()] }), product.compareAtPrice && product.compareAtPrice > product.price && (_jsxs("span", { className: "text-xs text-gray-400 line-through", children: ["\u20A6", product.compareAtPrice.toLocaleString()] }))] })] }));
}
