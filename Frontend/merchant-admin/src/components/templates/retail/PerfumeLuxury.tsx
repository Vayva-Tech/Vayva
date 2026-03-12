import { TemplateProps } from "@/components/templates/registry";
import { useStore } from "@/context/StoreContext";
import { formatCurrency } from "@vayva/shared";
import { Icon, Button } from "@vayva/ui";
import React, { useState } from "react";

interface PerfumeItem {
  id: string;
  name: string;
  price: number;
  type: string;
  notes: string;
  img: string;
  sizes: string[];
  images?: string[];
  description?: string;
}

export const PerfumeLuxuryTemplate: React.FC<TemplateProps> = ({
  businessName,
  demoMode,
}) => {
  const {
    products,
    addToCart,
    cartTotal,
    itemCount,
    isCartOpen,
    toggleCart,
    checkout,
    isCheckoutProcessing,
    currency,
  } = useStore();
  const [selectedSize] = useState("30ml");

  const perfumeItems = demoMode
    ? [
        {
          id: "perf_1",
          name: "Oud Gold",
          price: 18000,
          type: "retail",
          notes: "Sandlewood • Amber • Musk",
          img: "https://images.unsplash?.com/photo-1594035910387-fea4779426fa?q=80&w=800",
          sizes: ["30ml", "50ml", "100ml"],
        },
        {
          id: "perf_2",
          name: "Vanilla Musk",
          price: 9000,
          type: "retail",
          notes: "Taif Rose • OUD • Vanilla",
          img: "https://images.unsplash?.com/photo-1541643600914-78b084683601?q=80&w=800",
          sizes: ["15ml", "30ml"],
        },
        {
          id: "perf_3",
          name: "Night Sultan",
          price: 52000,
          type: "retail",
          notes: "Black Pepper • Leather • Smoke",
          img: "https://images.unsplash?.com/photo-1523293182086-7651a899d37f?q=80&w=800",
          sizes: ["50ml", "100ml"],
        },
      ]
    : (products as unknown as PerfumeItem[])
        .filter((p) => p.type === "retail")
        .map((p) => ({
          ...p,
          img: p.images?.[0] ||
            "https://images.unsplash?.com/photo-1594035910387-fea4779426fa?q=80&w=800",
          notes: p.description || "Premium Collection",
          sizes: ["30ml", "50ml", "100ml"],
        }));

  return (
    <div className="font-serif min-h-screen bg-[#0a0a0a] text-amber-50 selection:bg-amber-900 selection:text-white pb-20">
      <header className="py-8 px-8 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="text-2xl tracking-[0.2em] uppercase">
          {businessName || "ELIXIR"}
        </div>
        <div className="flex gap-8 text-xs tracking-widest uppercase opacity-80 items-center">
          <Button
            variant="ghost"
            className="hover:text-amber-400 transition-colors hidden md:block h-auto p-0 font-normal uppercase tracking-widest text-xs opacity-80"
          >
            Collection
          </Button>
          <Button
            variant="ghost"
            className="hover:text-amber-400 transition-colors hidden md:block h-auto p-0 font-normal uppercase tracking-widest text-xs opacity-80"
          >
            Our Story
          </Button>
          <Button
            variant="ghost"
            className="hover:text-amber-400 transition-colors flex items-center gap-2 h-auto p-0 font-normal uppercase tracking-widest text-xs opacity-80"
            onClick={() => toggleCart(true)}
          >
            Cart ({itemCount})
          </Button>
        </div>
      </header>

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex justify-end">
          <div className="w-full max-w-sm bg-[#111] border-l border-white/10 h-full p-8 flex flex-col animate-in slide-in-from-right text-amber-50">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl tracking-[0.2em] uppercase">
                Your Selection
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleCart(false)}
                className="text-amber-50 h-auto w-auto p-1"
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto space-y-4">
              {itemCount === 0 ? (
                <p className="text-white/30 text-center py-10 tracking-widest text-xs uppercase">
                  Your cart is empty.
                </p>
              ) : (
                <div className="p-4 border border-white/10 bg-white/5">
                  <div className="flex justify-between items-center">
                    <span className="font-light tracking-wide">
                      {itemCount} items
                    </span>
                    <span className="text-xl text-amber-400 font-medium">
                      {formatCurrency(cartTotal, currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 space-y-4">
              <Button
                onClick={() => checkout("website")}
                disabled={isCheckoutProcessing || itemCount === 0}
                className="w-full bg-amber-900/40 border border-amber-400/30 text-amber-400 py-4 text-xs tracking-[0.2em] uppercase hover:bg-amber-400 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed h-auto"
              >
                {isCheckoutProcessing ? "Processing" : "Secure Checkout"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash?.com/photo-1595166671047-97d3910c2c31?q=80&w=2000"
          alt="Luxury Perfume"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        <div className="relative z-10 text-center space-y-6 max-w-2xl px-4">
          <p className="text-amber-400 tracking-[0.3em] text-xs uppercase">
            The Signature Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-wide leading-tight">
            Essence of{" "}
            <span className="italic font-serif text-amber-200">Royalty</span>
          </h1>
          <Button className="mt-8 border border-amber-50/30 text-amber-50 px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-amber-900/20 hover:border-amber-400/50 transition-all duration-500 bg-transparent h-auto rounded-none">
            Discover the Scent
          </Button>
        </div>
      </section>

      <section className="py-24 px-4 md:px-12 bg-[#0a0a0a]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {perfumeItems.map((item: PerfumeItem) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden bg-[#111] mb-6 relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
                />
                {demoMode && item.id === "perf_1" && (
                  <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-amber-400 border border-amber-400/30 px-3 py-1">
                    Best Seller
                  </div>
                )}
              </div>
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-xl tracking-wide font-light">
                    {item.name}
                  </h3>
                  <p className="text-xs text-amber-50/40 tracking-wider uppercase mt-1">
                    {item.notes}
                  </p>
                </div>

                <div className="text-amber-400 font-medium text-lg">
                  {formatCurrency(item.price, currency)}
                </div>

                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Button
                    onClick={() =>
                      addToCart({ ...item, quantity: 1, productId: item.id })
                    }
                    className="border border-white/20 text-white hover:bg-white hover:text-black px-6 py-2 text-[10px] tracking-[0.2em] uppercase transition-all bg-transparent h-auto rounded-none"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 border-t border-white/5 bg-[#0f0f0f]">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-2xl font-light mb-4 text-white">
            Unsure which scent defines you?
          </h2>
          <p className="text-white/40 mb-8 font-light">
            Speak with our fragrance curators on WhatsApp for a personalized
            recommendation.
          </p>
          <Button
            onClick={() => checkout("whatsapp")}
            className="bg-[#25D366] text-black px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#128C7E] transition-colors flex items-center gap-2 mx-auto rounded-none h-auto"
          >
            <span>Start Consultation</span>
          </Button>
        </div>
      </section>
    </div>
  );
};
