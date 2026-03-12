"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { Clock, Flame, Check } from "lucide-react";
import { Button } from "@vayva/ui";
export function FoodPDP({ product }) {
    const { addToCart } = useStore();
    const [quantity, setQuantity] = useState(1);
    const metadata = product.metadata;
    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            variantId: product.id, // Simplified
            productName: product.name,
            price: product.price,
            quantity,
            image: product.images[0]
        });
    };
    return (_jsxs("div", { className: "grid md:grid-cols-2 gap-10", children: [_jsx("div", { className: "relative aspect-square bg-gray-100 rounded-2xl overflow-hidden", children: product.images[0] ? (_jsx(Image, { src: product.images[0], alt: product.name, fill: true, sizes: "(max-width: 768px) 100vw, 50vw", className: "object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-300", children: "No Image" })) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: product.name }), _jsxs("p", { className: "text-xl font-medium text-gray-900 mt-2", children: ["\u20A6", product.price.toLocaleString()] })] }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [metadata?.prepTimeMinutes && (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { children: [metadata.prepTimeMinutes, " mins prep"] })] })), metadata?.spiceLevel && metadata.spiceLevel !== "MILD" && (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm", children: [_jsx(Flame, { className: "w-4 h-4" }), _jsxs("span", { children: [metadata.spiceLevel, " Spicy"] })] })), metadata?.isVegetarian && (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm", children: [_jsx(Check, { className: "w-4 h-4" }), _jsx("span", { children: "Vegetarian" })] }))] }), _jsx("div", { className: "prose text-gray-600", children: product.description }), _jsxs("div", { className: "flex items-center gap-4 pt-6 border-t", children: [_jsxs("div", { className: "flex items-center border border-gray-300 rounded-lg", children: [_jsx(Button, { variant: "ghost", onClick: () => setQuantity(Math.max(1, quantity - 1)), className: "px-4 py-2 hover:bg-gray-50 h-auto", "aria-label": "Decrease quantity", children: "-" }), _jsx("span", { className: "w-12 text-center font-medium", children: quantity }), _jsx(Button, { variant: "ghost", onClick: () => setQuantity(quantity + 1), className: "px-4 py-2 hover:bg-gray-50 h-auto", "aria-label": "Increase quantity", children: "+" })] }), _jsxs(Button, { onClick: handleAddToCart, className: "flex-1 bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors h-auto", "aria-label": `Add ${product.name} to order for ₦${(product.price * quantity).toLocaleString()}`, children: ["Add to Order - \u20A6", (product.price * quantity).toLocaleString()] })] })] })] }));
}
