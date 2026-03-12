import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MobileHeader } from "./components/MobileHeader";
import { HeroBanner } from "./components/HeroBanner";
import { SectionHeader } from "./components/SectionHeader";
import { CategoryTileGrid } from "./components/CategoryTileGrid";
import { ProductGrid } from "./components/ProductGrid";
import { useStore } from "@/context/StoreContext";
export const AAFashionHome = ({ store, products }) => {
    const { cart } = useStore();
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    // Categories Derivation (Test or from products)
    const categories = [
        {
            id: "c1",
            name: "Dresses",
            slug: "dresses",
            imageUrl: "https://placehold.co/400x400/111/fff?text=Dresses",
        },
        {
            id: "c2",
            name: "Two Pieces",
            slug: "two-pieces",
            imageUrl: "https://placehold.co/400x400/222/fff?text=Sets",
        },
        {
            id: "c3",
            name: "Tops",
            slug: "tops",
            imageUrl: "https://placehold.co/400x400/333/fff?text=Tops",
        },
        {
            id: "c4",
            name: "Bottoms",
            slug: "bottoms",
            imageUrl: "https://placehold.co/400x400/444/fff?text=Pants",
        },
    ];
    const bestSellers = products.slice(0, 4);
    return (_jsxs("div", { className: "min-h-screen bg-background/70 backdrop-blur-xl pb-20 font-sans text-[#111111]", children: [_jsx(MobileHeader, { storeName: store.name, cartItemCount: cartItemCount }), _jsxs("main", { children: [_jsx(HeroBanner, { title: "NEW ARRIVALS", subtitle: "Elegant styles for every occasion" }), _jsx(SectionHeader, { title: "Top Categories", actionHref: `/collections/all?store=${store.slug}` }), _jsx(CategoryTileGrid, { categories: categories }), _jsx(SectionHeader, { title: "Best Sellers", actionHref: `/collections/all?store=${store.slug}` }), _jsx(ProductGrid, { products: products, storeSlug: store.slug }), _jsxs("div", { className: "mt-12 px-4 py-8 bg-background/40 backdrop-blur-sm text-center text-xs text-gray-400", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name] }), _jsx("p", { className: "mt-2", children: "Powered by Vayva" })] })] })] }));
};
