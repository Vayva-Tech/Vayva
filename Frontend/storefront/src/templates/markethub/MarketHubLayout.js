import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import Image from "next/image";
import { MarketHeader } from "./components/MarketHeader";
import { MarketHero } from "./components/MarketHero";
import { VendorCard } from "./components/VendorCard";
import { MultiVendorCart } from "./components/MultiVendorCart";
import { Star, ShoppingCart } from "lucide-react";
export const MarketHubLayout = ({ store, products }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const addToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing)
                return prev; // Test simple add
            return [...prev, { product, qty: 1 }];
        });
        setIsCartOpen(true);
    };
    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((i) => i.product.id !== id));
    };
    const handleCheckout = () => {
        alert("Proceeding to Multi-Vendor Split Checkout...");
        setCartItems([]);
        setIsCartOpen(false);
    };
    // Extract unique vendors from products for "Top Vendors" section
    const vendors = Array.from(new Map(products.map((p) => [p.vendorDetails?.id, p.vendorDetails])).values()).filter(Boolean);
    return (_jsxs("div", { className: "min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-20", children: [_jsx(MarketHeader, { storeName: store.name, cartCount: cartItems.length, onOpenCart: () => setIsCartOpen(true) }), _jsxs("main", { children: [_jsx(MarketHero, {}), _jsxs("section", { className: "max-w-7xl mx-auto px-6 py-12", children: [_jsxs("h3", { className: "font-bold text-xl text-gray-900 mb-6 flex items-center gap-2", children: [_jsx(Star, { className: "text-[#10B981]", fill: "currentColor", size: 20 }), "Trending Vendors"] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", children: vendors.map((v) => (_jsx(VendorCard, { vendor: v }, v.id))) })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-6 pb-12", children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-6", children: "Explore Marketplace" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4", children: products.map((product) => (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group", children: [_jsxs("div", { className: "aspect-[4/5] bg-background/50 backdrop-blur-sm relative overflow-hidden", children: [_jsx(Image, { src: product.images?.[0] || "/placeholder.png", alt: product.name, fill: true, className: "object-cover group-hover:scale-105 transition-transform duration-500" }), product.vendorDetails && ( // Added conditional rendering for the entire badge
                                                _jsxs("div", { className: "absolute top-3 left-3 bg-background/70 backdrop-blur-xl px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm z-10", children: [product.vendorDetails?.logo && (_jsx("div", { className: "relative w-3 h-3 rounded-full overflow-hidden", children: _jsx(Image, { src: product.vendorDetails.logo, alt: product.vendorDetails.name, fill: true, className: "object-cover" }) })), product.vendorDetails?.name] }))] }), _jsxs("div", { className: "p-4", children: [_jsx("div", { className: "text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wide", children: product.category }), _jsx("h4", { className: "font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]", children: product.name }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("span", { className: "font-bold text-gray-900", children: ["\u20A6", product.price.toLocaleString()] }), _jsx(Button, { onClick: () => addToCart(product), className: "w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors", children: _jsx(ShoppingCart, { size: 14 }) })] })] })] }, product.id))) })] })] }), _jsx(MultiVendorCart, { isOpen: isCartOpen, onClose: () => setIsCartOpen(false), items: cartItems, onRemove: removeFromCart, onCheckout: handleCheckout })] }));
};
