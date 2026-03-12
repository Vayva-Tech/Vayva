import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChopnowHeader } from "./components/ChopnowHeader";
import { FoodHero } from "./components/FoodHero";
import { MenuCategoryNav } from "./components/MenuCategoryNav";
import { FoodItemCard } from "./components/FoodItemCard";
import { ItemModal } from "./components/ItemModal";
import { useStore } from "@vayva/templates/context/StoreContext";
export const ChopnowLayout = ({ store, products }) => {
    const { addToCart } = useStore();
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Mains");
    // Extract categories
    const categories = Array.from(new Set(products.map((p) => p.category || "Other")));
    const handleAddToCart = (item, total) => {
        addToCart({
            productId: item.id,
            variantId: "default",
            productName: item.name,
            price: total / item.qty, // Normalize unit price including modifiers
            quantity: item.qty,
            image: item.images?.[0],
        });
        setSelectedItem(null);
    };
    // Filter products
    const filteredProducts = products.filter((p) => p.category === activeCategory);
    return (_jsxs("div", { className: "min-h-screen bg-background/40 backdrop-blur-sm font-sans text-gray-900 pb-20", children: [_jsx(ChopnowHeader, {}), _jsx(FoodHero, {}), _jsx(MenuCategoryNav, { categories: categories, activeCategory: activeCategory, onSelect: setActiveCategory }), _jsx("main", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl min-h-[50vh]", children: [_jsx("div", { className: "px-4 py-4 font-bold text-lg border-b border-gray-100 text-gray-900", children: activeCategory }), filteredProducts.map((p) => (_jsx(FoodItemCard, { item: p, onClick: () => setSelectedItem(p) }, p.id))), filteredProducts.length === 0 && (_jsx("div", { className: "p-8 text-center text-gray-400", children: "No items available in this category." }))] }) }), selectedItem && (_jsx(ItemModal, { item: selectedItem, onClose: () => setSelectedItem(null), onAddToCart: handleAddToCart }))] }));
};
