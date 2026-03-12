import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { PublicStore, PublicProduct } from "@/types/storefront";
import { BulkHeader } from "./components/BulkHeader";
import { BulkHero } from "./components/BulkHero";
import { PricingTiersTable } from "./components/PricingTiersTable";
import { RFQDrawer } from "./components/RFQDrawer";
import { QuoteSuccess } from "./components/QuoteSuccess";
import { Clock, Package } from "@phosphor-icons/react/ssr";

interface BulkTradeLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const BulkTradeLayout = ({
  store,
  products,
}: BulkTradeLayoutProps): React.JSX.Element => {
  const [rfqItems, setRfqItems] = useState<
    { product: PublicProduct; qty: number }[]
  >([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initial qty state map for the catalog view inputs
  const [inputQtys, setInputQtys] = useState<Record<string, number>>({});

  const handleInputQtyChange = (id: string, val: number) => {
    setInputQtys((prev) => ({ ...prev, [id]: val }));
  };

  const addToRFQ = (product: PublicProduct) => {
    const qty = inputQtys[product.id] || product.wholesaleDetails?.moq || 1;

    setRfqItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return prev.map((i: any) =>
          i.product.id === product.id ? { ...i, qty } : i,
        );
      }
      return [...prev, { product, qty }];
    });
    setIsDrawerOpen(true);
  };

  const removeFromRFQ = (id: string) => {
    setRfqItems((prev) => prev.filter((i) => i.product.id !== id));
  };

  const updateRFQQty = (id: string, qty: number) => {
    setRfqItems((prev) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prev.map((i: any) => (i.product.id === id ? { ...i, qty } : i)),
    );
  };

  const handleSubmitQuote = () => {
    setIsDrawerOpen(false);
    setRfqItems([]);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 pb-20">
      <BulkHeader
        storeName={store.name}
        rfqCount={rfqItems.length}
        onOpenRFQ={() => setIsDrawerOpen(true)}
      />

      <main>
        <BulkHero storeName={store.name} />

        {/* Catalog Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] mb-2">
                Wholesale Catalog
              </h2>
              <p className="text-gray-500">
                Tiered pricing available on all items.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const moq = product.wholesaleDetails?.moq || 1;
              const tiers = product.wholesaleDetails?.pricingTiers || [];
              const inputQty = inputQtys[product.id] || moq;

              // Find active price based on input Qty (preview)
              const activeTier =
                [...tiers].reverse().find((t) => inputQty >= t.minQty) ||
                tiers[0];
              const currentPrice = activeTier
                ? activeTier.price
                : product.price;

              return (
                <div
                  key={product.id}
                  className="bg-transparent border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-48 bg-background/50 backdrop-blur-sm relative">
                    <img
                      src={product.images?.[0]}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded">
                      MOQ: {moq}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 font-bold uppercase mb-1">
                        {product.category}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 leading-tight">
                        {product.name}
                      </h3>

                      <div className="flex gap-4 text-xs text-gray-400 mb-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-1">
                          <Package size={12} /> Stock:{" "}
                          {product.inStock ? "High" : "Low"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />{" "}
                          {product.wholesaleDetails?.leadTime}
                        </div>
                      </div>

                      <div className="mb-4 bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-gray-100">
                        <PricingTiersTable
                          tiers={tiers}
                          currentQty={inputQty}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-500 font-bold">
                          Configure Quantity
                        </div>
                        <div className="text-xl font-black text-[#0F172A]">
                          ₦{currentPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={moq}
                          value={inputQty}
                          onChange={(e: any) =>
                            handleInputQtyChange(
                              product.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-20 border border-gray-300 rounded-lg px-2 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <Button
                          onClick={() => addToRFQ(product)}
                          className="flex-1 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                        >
                          Add to RFQ
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-transparent border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} {store.name}. Wholesale Terms
            Apply.
          </p>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <RFQDrawer
        isOpen={isDrawerOpen}
        items={rfqItems}
        onClose={() => setIsDrawerOpen(false)}
        onRemoveItem={removeFromRFQ}
        onUpdateQty={updateRFQQty}
        onSubmit={handleSubmitQuote}
      />

      {showSuccess && <QuoteSuccess onClose={() => setShowSuccess(false)} />}
    </div>
  );
};
