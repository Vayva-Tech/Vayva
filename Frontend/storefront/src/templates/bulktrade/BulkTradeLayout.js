import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { BulkHeader } from "./components/BulkHeader";
import { BulkHero } from "./components/BulkHero";
import { PricingTiersTable } from "./components/PricingTiersTable";
import { RFQDrawer } from "./components/RFQDrawer";
import { QuoteSuccess } from "./components/QuoteSuccess";
import { Clock, Package } from "lucide-react";
export const BulkTradeLayout = ({ store, products }) => {
    const [rfqItems, setRfqItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // Initial qty state map for the catalog view inputs
    const [inputQtys, setInputQtys] = useState({});
    const handleInputQtyChange = (id, val) => {
        setInputQtys((prev) => ({ ...prev, [id]: val }));
    };
    const addToRFQ = (product) => {
        const qty = inputQtys[product.id] || product.wholesaleDetails?.moq || 1;
        setRfqItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) => i.product.id === product.id ? { ...i, qty } : i);
            }
            return [...prev, { product, qty }];
        });
        setIsDrawerOpen(true);
    };
    const removeFromRFQ = (id) => {
        setRfqItems((prev) => prev.filter((i) => i.product.id !== id));
    };
    const updateRFQQty = (id, qty) => {
        setRfqItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, qty } : i)));
    };
    const handleSubmitQuote = () => {
        setIsDrawerOpen(false);
        setRfqItems([]);
        setShowSuccess(true);
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#F8FAFC] font-sans text-gray-900 pb-20", children: [_jsx(BulkHeader, { storeName: store.name, rfqCount: rfqItems.length, onOpenRFQ: () => setIsDrawerOpen(true) }), _jsxs("main", { children: [_jsx(BulkHero, { storeName: store.name }), _jsxs("section", { className: "max-w-7xl mx-auto px-6 py-12", children: [_jsx("div", { className: "flex justify-between items-end mb-8", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-[#0F172A] mb-2", children: "Wholesale Catalog" }), _jsx("p", { className: "text-gray-500", children: "Tiered pricing available on all items." })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: products.map((product) => {
                                    const moq = product.wholesaleDetails?.moq || 1;
                                    const tiers = product.wholesaleDetails?.pricingTiers || [];
                                    const inputQty = inputQtys[product.id] || moq;
                                    // Find active price based on input Qty (preview)
                                    const activeTier = [...tiers].reverse().find((t) => inputQty >= t.minQty) ||
                                        tiers[0];
                                    const currentPrice = activeTier
                                        ? activeTier.price
                                        : product.price;
                                    return (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col", children: [_jsxs("div", { className: "h-48 bg-background/50 backdrop-blur-sm relative", children: [_jsx("img", { src: product.images?.[0], className: "w-full h-full object-cover" }), _jsxs("div", { className: "absolute top-2 left-2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded", children: ["MOQ: ", moq] })] }), _jsxs("div", { className: "p-5 flex-1 flex flex-col", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs text-blue-600 font-bold uppercase mb-1", children: product.category }), _jsx("h3", { className: "font-bold text-gray-900 mb-2 leading-tight", children: product.name }), _jsxs("div", { className: "flex gap-4 text-xs text-gray-400 mb-4 border-b border-gray-100 pb-4", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Package, { size: 12 }), " Stock:", " ", product.inStock ? "High" : "Low"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 12 }), " ", product.wholesaleDetails?.leadTime] })] }), _jsx("div", { className: "mb-4 bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-gray-100", children: _jsx(PricingTiersTable, { tiers: tiers, currentQty: inputQty }) })] }), _jsxs("div", { className: "pt-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("div", { className: "text-xs text-gray-500 font-bold", children: "Configure Quantity" }), _jsxs("div", { className: "text-xl font-black text-[#0F172A]", children: ["\u20A6", currentPrice.toLocaleString()] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", min: moq, value: inputQty, onChange: (e) => handleInputQtyChange(product.id, parseInt(e.target.value) || 0), className: "w-20 border border-gray-300 rounded-lg px-2 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" }), _jsx(Button, { onClick: () => addToRFQ(product), className: "flex-1 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold py-2.5 rounded-lg transition-colors", children: "Add to RFQ" })] })] })] })] }, product.id));
                                }) })] })] }), _jsx("footer", { className: "bg-background/70 backdrop-blur-xl border-t border-gray-200 py-12 mt-12", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm", children: _jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". Wholesale Terms Apply."] }) }) }), _jsx(RFQDrawer, { isOpen: isDrawerOpen, items: rfqItems, onClose: () => setIsDrawerOpen(false), onRemoveItem: removeFromRFQ, onUpdateQty: updateRFQQty, onSubmit: handleSubmitQuote }), showSuccess && _jsx(QuoteSuccess, { onClose: () => setShowSuccess(false) })] }));
};
