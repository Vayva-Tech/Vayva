import React from "react";
import { Button } from "@vayva/ui";
import { MobileHeader } from "./components/MobileHeader";
import { HeroTechBanner } from "./components/HeroTechBanner";
import { SectionHeaderRow } from "./components/SectionHeaderRow";
import { HorizontalProductCarousel } from "./components/HorizontalProductCarousel";
import { ProductCardTech } from "./components/ProductCardTech";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { useStore } from "@vayva/templates/context/StoreContext";

interface GizmoTechHomeProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const GizmoTechHome = ({
  store,
  products,
}: GizmoTechHomeProps): React.JSX.Element => {
  const { cart } = useStore();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Test Segmentation
  const topPicks = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans text-[#0B0F19]">
      <MobileHeader storeName={store.name} cartItemCount={cartItemCount} />

      <main>
        {/* Hero */}
        <HeroTechBanner />

        {/* Top Picks Section - Grid */}
        <SectionHeaderRow
          title="Top Picks"
          description="Curated best sellers just for you."
          actionHref={`/collections/all?store=${store.slug}`}
        />
        <div className="grid grid-cols-2 gap-4 px-4 mb-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {topPicks.map((product: any) => (
            <ProductCardTech
              key={product.id}
              product={product}
              storeSlug={store.slug}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="h-2 bg-background/40 backdrop-blur-sm mb-8" />

        {/* Trending Now - Horizontal Scroll */}
        <SectionHeaderRow
          title="Trending Now"
          description="What everyone is buying this week."
          actionHref={`/collections/trending?store=${store.slug}`}
        />
        <HorizontalProductCarousel products={trending} storeSlug={store.slug} />

        {/* Tech Brands Banner / Trust Signals (Optional) */}
        <div className="mt-8 px-4">
          <div className="bg-[#0B0F19] rounded-xl p-6 text-white text-center">
            <h4 className="font-bold text-lg mb-2">Build Your Setup</h4>
            <p className="text-gray-400 text-sm mb-4">
              Complete your workstation with our pro accessories.
            </p>
            <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold w-full hover:bg-blue-500 transition-colors">
              View Accessories
            </Button>
          </div>
        </div>

        {/* Footer / Spacing */}
        <div className="mt-12 px-4 py-8 bg-background/40 backdrop-blur-sm text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} {store.name}
          </p>
          <p className="mt-2 text-gray-300">Powered by Vayva</p>
        </div>
      </main>
    </div>
  );
};
