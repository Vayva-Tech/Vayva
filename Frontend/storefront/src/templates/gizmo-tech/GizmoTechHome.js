import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@vayva/ui";
import { MobileHeader } from "./components/MobileHeader";
import { HeroTechBanner } from "./components/HeroTechBanner";
import { SectionHeaderRow } from "./components/SectionHeaderRow";
import { HorizontalProductCarousel } from "./components/HorizontalProductCarousel";
import { ProductCardTech } from "./components/ProductCardTech";
import { useStore } from "@/context/StoreContext";
export const GizmoTechHome = ({ store, products }) => {
    const { cart } = useStore();
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    // Test Segmentation
    const topPicks = products.slice(0, 4);
    const trending = products.slice(4, 8);
    return (_jsxs("div", { className: "min-h-screen bg-background/70 backdrop-blur-xl pb-20 font-sans text-[#0B0F19]", children: [_jsx(MobileHeader, { storeName: store.name, cartItemCount: cartItemCount }), _jsxs("main", { children: [_jsx(HeroTechBanner, {}), _jsx(SectionHeaderRow, { title: "Top Picks", description: "Curated best sellers just for you.", actionHref: `/collections/all?store=${store.slug}` }), _jsx("div", { className: "grid grid-cols-2 gap-4 px-4 mb-8", children: topPicks.map((product) => (_jsx(ProductCardTech, { product: product, storeSlug: store.slug }, product.id))) }), _jsx("div", { className: "h-2 bg-background/40 backdrop-blur-sm mb-8" }), _jsx(SectionHeaderRow, { title: "Trending Now", description: "What everyone is buying this week.", actionHref: `/collections/trending?store=${store.slug}` }), _jsx(HorizontalProductCarousel, { products: trending, storeSlug: store.slug }), _jsx("div", { className: "mt-8 px-4", children: _jsxs("div", { className: "bg-[#0B0F19] rounded-xl p-6 text-white text-center", children: [_jsx("h4", { className: "font-bold text-lg mb-2", children: "Build Your Setup" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Complete your workstation with our pro accessories." }), _jsx(Button, { className: "bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold w-full hover:bg-blue-500 transition-colors", children: "View Accessories" })] }) }), _jsxs("div", { className: "mt-12 px-4 py-8 bg-background/40 backdrop-blur-sm text-center text-xs text-gray-400", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name] }), _jsx("p", { className: "mt-2 text-gray-300", children: "Powered by Vayva" })] })] })] }));
};
