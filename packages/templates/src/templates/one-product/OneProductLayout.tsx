import React, { useState } from "react";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { OneHeader } from "./components/OneHeader";
import { HeroLanding } from "./components/HeroLanding";
import { BenefitsSection } from "./components/BenefitsSection";
import { SocialProof } from "./components/SocialProof";
import { FAQAccordion } from "./components/FAQAccordion";
import { StickyCTA } from "./components/StickyCTA";
import { CheckoutModal } from "./components/CheckoutModal";

interface OneProductLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const OneProductLayout = ({
  store,
  products,
}: OneProductLayoutProps) => {
  // Determine main product and upsell
  // Logic: Look for the first product as main, and the upsellProductId as secondary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (store.theme as any).oneProductConfig || {};

  // Find main product (first one)
  const activeProduct = products[0];

  // Find upsell product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsellProduct = (config as any).upsellProductId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? products.find((p: PublicProduct) => p.id === (config as any).upsellProductId)
    : undefined;

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyQty, setBuyQty] = useState(1);

  const handleBuy = (qty: number = 1) => {
    setBuyQty(qty);
    setIsCheckoutOpen(true);
  };

  if (!activeProduct) return <div>No product found.</div>;

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 pb-20 md:pb-0">
      <OneHeader storeName={store.name} />

      <main>
        <HeroLanding
          product={activeProduct}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          headline={config.heroHeadline || activeProduct.name}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          subHeadline={config.subHeadline || activeProduct.description}
          onBuy={handleBuy}
        />

        {config.benefits && <BenefitsSection benefits={config.benefits} />}

        {config.testimonials && (
          <SocialProof testimonials={config.testimonials} />
        )}

        {config.faqs && <FAQAccordion faqs={config.faqs} />}

        {/* Guarantee Banner */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {config.guaranteeText && (
          <section className="bg-gray-900 text-white py-12 text-center">
            <div className="max-w-4xl mx-auto px-6">
              <h3 className="text-xl font-bold mb-2">Our Promise</h3>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p className="opacity-80">{config.guaranteeText}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-background/40 backdrop-blur-sm py-12 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
      </footer>

      <StickyCTA price={activeProduct.price} onBuy={() => handleBuy(1)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={activeProduct}
        qty={buyQty}
        upsellProduct={upsellProduct}
      />
    </div>
  );
};
