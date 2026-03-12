import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Button } from "@vayva/ui";
import { useStore } from "@vayva/templates/context/StoreContext";
export const ProductCard = ({ product, storeSlug = "#" }) => {
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
    return (_jsxs(Link, { href: `/products/${product.id}?store=${storeSlug}`, className: "group block", children: [_jsxs("div", { className: "relative aspect-[3/4] bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden mb-3", children: [_jsx(Image, { src: product.images[0], alt: product.name, fill: true, className: "object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx(Button, { size: "icon", className: `absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 h-auto ${added ? "bg-green-500 text-white" : "bg-background/70 backdrop-blur-xl text-black hover:bg-black hover:text-white"}`, onClick: handleAdd, "aria-label": added ? "Product added to cart" : `Add ${product.name} to cart`, children: added ? (_jsx(Check, { size: 18, strokeWidth: 2.5 })) : (_jsx(Plus, { size: 18, strokeWidth: 2.5 })) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("h3", { className: "font-medium text-[#111111] text-sm leading-tight line-clamp-2 min-h-[2.5em]", children: product.name }), _jsxs("p", { className: "font-bold text-[#111111] text-sm", children: ["\u20A6", product.price.toLocaleString()] })] })] }));
};
