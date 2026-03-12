import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EditorialHeader } from "./components/EditorialHeader";
import { LifestyleHero } from "./components/LifestyleHero";
import { FeaturedCollectionEditorial } from "./components/FeaturedCollectionEditorial";
import { RitualsSection } from "./components/RitualsSection";
import { SubscriptionCTA } from "./components/SubscriptionCTA";
import { useStore } from "@/context/StoreContext";
export const BloomeHomeLayout = ({ store, products, }) => {
    const { cart } = useStore();
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    // Test Segmentation
    const featuredCollection = products.slice(0, 3);
    const bestSellers = products.slice(0, 4);
    return (_jsxs("div", { className: "min-h-screen bg-[#FAFAF9] font-sans text-[#2E2E2E]", children: [_jsx(EditorialHeader, { storeName: store.name, cartItemCount: cartItemCount }), _jsxs("main", { children: [_jsx(LifestyleHero, { headline: "Slow down your routine.", subheadline: "The new collection", ctaText: "Shop Essentials" }), _jsx(FeaturedCollectionEditorial, { title: "Curated for You", products: featuredCollection, storeSlug: store.slug }), _jsx("section", { className: "py-12 bg-background/70 backdrop-blur-xl border-y border-stone-100", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center max-w-4xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-[#C9B7A2] text-xl", children: "\uD83C\uDF3F" }), _jsx("h4", { className: "font-serif text-sm", children: "100% Natural" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-[#C9B7A2] text-xl", children: "\uD83D\uDC30" }), _jsx("h4", { className: "font-serif text-sm", children: "Cruelty Free" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-[#C9B7A2] text-xl", children: "\u2728" }), _jsx("h4", { className: "font-serif text-sm", children: "Handmade" })] })] }) }), _jsx(RitualsSection, {}), _jsx(SubscriptionCTA, {}), _jsxs("div", { className: "py-16 px-6 text-center text-stone-400 text-sm bg-[#FAFAF9]", children: [_jsx("p", { className: "font-serif text-lg text-[#2E2E2E] mb-4", children: store.name }), _jsx("p", { className: "mb-8 max-w-xs mx-auto text-xs leading-relaxed", children: "Mindfully crafted essentials for your home and body. Designed to bring peace to your daily rituals." }), _jsxs("div", { className: "flex justify-center gap-6 text-xs uppercase tracking-widest mb-12", children: [_jsx("span", { children: "Instagram" }), _jsx("span", { children: "Pinterest" }), _jsx("span", { children: "TikTok" })] }), _jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". Powered by Vayva."] })] })] })] }));
};
