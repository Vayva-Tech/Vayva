import React, { useState } from "react";
import { Button } from "@vayva/ui";
import Link from "next/link";
import Image from "next/image";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { MarketHeader } from "./components/MarketHeader";
import { MarketHero } from "./components/MarketHero";
import { VendorCard } from "./components/VendorCard";
import { MultiVendorCart } from "./components/MultiVendorCart";
import { MarketActivityTicker } from "./components/MarketActivityTicker";
import { Star, ShoppingCart } from "lucide-react";

interface MarketHubLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const MarketHubLayout = ({
  store,
  products,
}: MarketHubLayoutProps): React.JSX.Element => {
  const [cartItems, setCartItems] = useState<
    { product: PublicProduct; qty: number }[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: PublicProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev; // Test simple add
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== id));
  };

  const handleCheckout = () => {
    alert("Proceeding to Multi-Vendor Split Checkout...");
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Extract unique vendors from products for "Top Vendors" section
  const vendors = Array.from(
    new Map(
      products
        .filter((p) => p.vendorDetails)
        .map((p) => [p.vendorDetails!.id, p.vendorDetails!]),
    ).values(),
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-20">
      <MarketHeader
        storeName={store.name}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <MarketActivityTicker />

      <main className="relative">
        {/* Background Ambient Gfx */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <MarketHero />
        </div>

        {/* Top Vendors */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
            <Star className="text-[#10B981]" fill="currentColor" size={20} />
            Trending Vendors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </section>

        {/* Product Feed */}
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <h3 className="font-bold text-xl text-gray-900 mb-6">
            Explore Marketplace
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-transparent border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-[4/5] bg-background/50 backdrop-blur-sm relative overflow-hidden">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Vendor Badge */}
                  {product.vendorDetails && (
                    <div className="absolute top-3 left-3 bg-transparent/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm z-10">
                      {product.vendorDetails.logo && (
                        <div className="relative w-3 h-3 rounded-full overflow-hidden">
                          <Image
                            src={product.vendorDetails.logo}
                            alt={product.vendorDetails.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {product.vendorDetails.name}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wide">
                    {product.category}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h4>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-[#10B981] hover:text-white flex items-center justify-center transition-colors"
                    >
                      <ShoppingCart size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MultiVendorCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};
