import React, { useState } from "react";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { ChopnowHeader } from "./components/ChopnowHeader";
import { FoodHero } from "./components/FoodHero";
import { MenuCategoryNav } from "./components/MenuCategoryNav";
import { FoodItemCard } from "./components/FoodItemCard";
import { ItemModal } from "./components/ItemModal";
import { useStore } from "@vayva/templates/context/StoreContext";

interface ChopnowLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const ChopnowLayout = ({ store, products }: ChopnowLayoutProps): React.JSX.Element => {
  const { addToCart } = useStore();
  const [selectedItem, setSelectedItem] = useState<PublicProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState("Mains");

  // Extract categories
  const categories = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Set(products.map((p: any) => p.category || "Other")),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (item: any, total: number) => {
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
  const filteredProducts = products.filter(
    (p) => p.category === activeCategory,
  );

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm font-sans text-gray-900 pb-20">
      <ChopnowHeader />
      <FoodHero />

      <MenuCategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <main className="max-w-2xl mx-auto">
        <div className="bg-transparent min-h-[50vh]">
          <div className="px-4 py-4 font-bold text-lg border-b border-gray-100 text-gray-900">
            {activeCategory}
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filteredProducts.map((p: any) => (
            <FoodItemCard
              key={p.id}
              item={p}
              onClick={() => setSelectedItem(p)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No items available in this category.
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};
