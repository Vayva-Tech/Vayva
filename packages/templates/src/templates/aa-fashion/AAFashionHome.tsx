import React from "react";
import { MobileHeader } from "./components/MobileHeader";
import { HeroBanner } from "./components/HeroBanner";
import { SectionHeader } from "./components/SectionHeader";
import { CategoryTileGrid } from "./components/CategoryTileGrid";
import { ProductGrid } from "./components/ProductGrid";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { useStore } from "@vayva/templates/context/StoreContext";

interface AAFashionHomeProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const AAFashionHome = ({ store, products }: AAFashionHomeProps): React.JSX.Element => {
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

  const _bestSellers = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans text-[#111111]">
      <MobileHeader storeName={store.name} cartItemCount={cartItemCount} />

      <main>
        {/* Hero */}
        <HeroBanner
          title="NEW ARRIVALS"
          subtitle="Elegant styles for every occasion"
        />

        {/* Categories */}
        <SectionHeader
          title="Top Categories"
          actionHref={`/collections/all?store=${store.slug}`}
        />
        <CategoryTileGrid categories={categories} />

        {/* Best Sellers */}
        <SectionHeader
          title="Best Sellers"
          actionHref={`/collections/all?store=${store.slug}`}
        />
        <ProductGrid products={products} storeSlug={store.slug} />

        {/* Footer / Spacing */}
        <div className="mt-12 px-4 py-8 bg-background/40 backdrop-blur-sm text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} {store.name}
          </p>
          <p className="mt-2">Powered by Vayva</p>
        </div>
      </main>
    </div>
  );
};
