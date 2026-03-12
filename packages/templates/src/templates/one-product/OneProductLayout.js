import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { OneHeader } from "./components/OneHeader";
import { HeroLanding } from "./components/HeroLanding";
import { BenefitsSection } from "./components/BenefitsSection";
import { SocialProof } from "./components/SocialProof";
import { FAQAccordion } from "./components/FAQAccordion";
import { StickyCTA } from "./components/StickyCTA";
import { CheckoutModal } from "./components/CheckoutModal";
export const OneProductLayout = ({ store, products, }) => {
    // Determine main product and upsell
    // Logic: Look for the first product as main, and the upsellProductId as secondary
    const config = store.theme.oneProductConfig || {};
    // Find main product (first one)
    const activeProduct = products[0];
    // Find upsell product
    const upsellProduct = config.upsellProductId
        ? products.find((p) => p.id === config.upsellProductId)
        : undefined;
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [buyQty, setBuyQty] = useState(1);
    const handleBuy = (qty = 1) => {
        setBuyQty(qty);
        setIsCheckoutOpen(true);
    };
    if (!activeProduct)
        return _jsx("div", { children: "No product found." });
    return (_jsxs("div", { className: "min-h-screen bg-background/70 backdrop-blur-xl font-sans text-gray-900 pb-20 md:pb-0", children: [_jsx(OneHeader, { storeName: store.name }), _jsxs("main", { children: [_jsx(HeroLanding, { product: activeProduct, headline: config.heroHeadline || activeProduct.name, subHeadline: config.subHeadline || activeProduct.description, onBuy: handleBuy }), config.benefits && _jsx(BenefitsSection, { benefits: config.benefits }), config.testimonials && (_jsx(SocialProof, { testimonials: config.testimonials })), config.faqs && _jsx(FAQAccordion, { faqs: config.faqs }), config.guaranteeText && (_jsx("section", { className: "bg-gray-900 text-white py-12 text-center", children: _jsxs("div", { className: "max-w-4xl mx-auto px-6", children: [_jsx("h3", { className: "text-xl font-bold mb-2", children: "Our Promise" }), _jsx("p", { className: "opacity-80", children: config.guaranteeText })] }) }))] }), _jsx("footer", { className: "bg-background/40 backdrop-blur-sm py-12 border-t border-gray-200 text-center", children: _jsxs("p", { className: "text-gray-400 text-sm", children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". All rights reserved."] }) }), _jsx(StickyCTA, { price: activeProduct.price, onBuy: () => handleBuy(1) }), _jsx(CheckoutModal, { isOpen: isCheckoutOpen, onClose: () => setIsCheckoutOpen(false), product: activeProduct, qty: buyQty, upsellProduct: upsellProduct })] }));
};
