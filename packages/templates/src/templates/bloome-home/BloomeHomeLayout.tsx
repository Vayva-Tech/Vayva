import React from "react";
import { EditorialHeader } from "./components/EditorialHeader";
import { LifestyleHero } from "./components/LifestyleHero";
import { FeaturedCollectionEditorial } from "./components/FeaturedCollectionEditorial";
import { RitualsSection } from "./components/RitualsSection";
import { SubscriptionCTA } from "./components/SubscriptionCTA";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { useStore } from "@vayva/templates/context/StoreContext";

interface BloomeHomeLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const BloomeHomeLayout = ({
  store,
  products,
}: BloomeHomeLayoutProps) => {
  const { cart } = useStore();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Test Segmentation
  const featuredCollection = products.slice(0, 3);
  const _bestSellers = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-[#2E2E2E]">
      <EditorialHeader storeName={store.name} cartItemCount={cartItemCount} />

      <main>
        {/* 1. Hero Lifestyle */}
        <LifestyleHero
          headline="Slow down your routine."
          subheadline="The new collection"
          ctaText="Shop Essentials"
        />

        {/* 2. Featured Collection (Large Cards) */}
        <FeaturedCollectionEditorial
          title="Curated for You"
          products={featuredCollection}
          storeSlug={store.slug}
        />

        {/* 3. Why Customers Love Us (Trust Signals) */}
        <section className="py-12 bg-transparent border-y border-stone-100">
          <div className="grid grid-cols-3 gap-4 text-center max-w-4xl mx-auto px-4">
            <div className="space-y-2">
              <div className="text-[#C9B7A2] text-xl">🌿</div>
              <h4 className="font-serif text-sm">100% Natural</h4>
            </div>
            <div className="space-y-2">
              <div className="text-[#C9B7A2] text-xl">🐰</div>
              <h4 className="font-serif text-sm">Cruelty Free</h4>
            </div>
            <div className="space-y-2">
              <div className="text-[#C9B7A2] text-xl">✨</div>
              <h4 className="font-serif text-sm">Handmade</h4>
            </div>
          </div>
        </section>

        {/* 4. Rituals / How To Use */}
        <RitualsSection />

        {/* 5. Subscription CTA */}
        <SubscriptionCTA />

        {/* 6. Footer */}
        <div className="py-16 px-6 text-center text-stone-400 text-sm bg-[#FAFAF9]">
          <p className="font-serif text-lg text-[#2E2E2E] mb-4">{store.name}</p>
          <p className="mb-8 max-w-xs mx-auto text-xs leading-relaxed">
            Mindfully crafted essentials for your home and body. Designed to
            bring peace to your daily rituals.
          </p>
          <div className="flex justify-center gap-6 text-xs uppercase tracking-widest mb-12">
            <span>Instagram</span>
            <span>Pinterest</span>
            <span>TikTok</span>
          </div>
          <p>
            © {new Date().getFullYear()} {store.name}. Powered by Vayva.
          </p>
        </div>
      </main>
    </div>
  );
};
