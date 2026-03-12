import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Button } from "@vayva/ui";
import { useStore } from "@/context/StoreContext";
export const ProductCardTech = ({ product, storeSlug = "#", variant = "grid", }) => {
    const { addToCart } = useStore();
    const [added, setAdded] = React.useState(false);
    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            productId: product.id,
            variantId: "default",
            productName: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0],
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };
    const cardWidth = variant === "carousel" ? "w-[160px] md:w-[200px] flex-shrink-0" : "w-full";
    return (_jsxs(Link, { href: `/product/${product.id}?store=${storeSlug}`, className: `group block ${cardWidth}`, children: [_jsxs("div", { className: "relative aspect-square bg-background/40 backdrop-blur-sm rounded-xl overflow-hidden mb-3 border border-gray-100", children: [_jsx(Image, { src: product.images[0], alt: product.name, fill: true, className: "object-cover p-2 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" }), !product.inStock && (_jsx("div", { className: "absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide", children: "Out of Stock" })), _jsx(Button, { variant: "ghost", size: "icon", className: `absolute bottom-2 right-2 p-2 rounded-lg transition-all duration-300 shadow-sm border h-auto ${added ? "bg-green-500 text-white border-green-500" : "bg-background/70 backdrop-blur-xl text-blue-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"}`, onClick: handleAdd, "aria-label": added ? "Added to cart" : `Add ${product.name} to cart`, children: added ? (_jsx(Check, { size: 16, strokeWidth: 3 })) : (_jsx(Plus, { size: 16, strokeWidth: 3 })) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("h3", { className: "font-semibold text-[#0B0F19] text-sm leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-blue-600 transition-colors", children: product.name }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "font-bold text-[#0B0F19] text-sm", children: ["\u20A6", product.price.toLocaleString()] }), product.specs && product.specs[0] && (_jsx("span", { className: "text-[10px] text-gray-500 bg-background/50 backdrop-blur-sm px-1 rounded truncate max-w-[60px]", children: product.specs[0].value }))] })] })] }));
};
