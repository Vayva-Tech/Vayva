"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct } from "@/types/storefront";
import { MarketHeader } from "@/templates/markethub/components/MarketHeader";
import { MultiVendorCart } from "@/templates/markethub/components/MultiVendorCart";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@vayva/ui";
import { SealCheck as BadgeCheck, Star, MapPin, ShareNetwork as Share2, ShieldCheck } from "@phosphor-icons/react/ssr";
import Image from "next/image";

export default function VendorProfilePage() {
  const params = useParams();
  const { store } = useStore();
  const [vendorProducts, setVendorProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<
    { product: PublicProduct; qty: number }[]
  >([]);

  const vendorId = params.id as string;

  useEffect(() => {
    if (store) {
      const load = async () => {
        const allProducts = await StorefrontService.getProducts(store.id);
        const filtered = allProducts.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.vendorDetails?.id === vendorId,
        );
        setVendorProducts(filtered);
        setLoading(false);
      };
      load();
    }
  }, [store, vendorId]);

  const vendor = vendorProducts[0]?.vendorDetails;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/40 backdrop-blur-sm">
        Loading Vendor...
      </div>
    );
  if (!vendor)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/40 backdrop-blur-sm">
        Vendor not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <MarketHeader
        storeName={store?.name}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Vendor Profile Header */}
      <div className="bg-background/70 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
            <Image
              src={vendor?.logo || "/placeholder-avatar.png"}
              alt={vendor?.name || "Vendor"}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black text-gray-900">
                {vendor?.name || "Vendor"}
              </h1>
              {vendor?.isVerified && (
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black uppercase tracking-wider self-center md:self-auto">
                  <BadgeCheck size={14} /> Verified Member
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 font-medium mb-8">
              <div className="flex items-center gap-1.5">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="text-gray-900 font-bold">
                  {vendor?.rating || 0}
                </span>{" "}
                (120 Reviews)
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} /> Lagos, Nigeria
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <ShieldCheck size={16} /> Fast Dispatch
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-3">
              <Button className="bg-[#111827] text-white px-8 py-2.5 rounded-xl font-bold">
                Follow Store
              </Button>
              <Button
                variant="outline"
                className="rounded-xl px-4 border-gray-200"
              >
                <Share2 size={18} />
              </Button>
            </div>
          </div>

          <div className="bg-background/40 backdrop-blur-sm p-6 rounded-3xl border border-gray-200 w-full md:w-64">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Response Rate
            </p>
            <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-[#10B981] w-[95%]"></div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              95% typical response within 1 hour
            </p>
          </div>
        </div>
      </div>

      {/* Product Feed */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-gray-900 mb-8">
          Curated Collection
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {vendorProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={store?.slug || ""}
            />
          ))}
        </div>
      </main>

      <MultiVendorCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={(id: string) =>
          setCartItems((prev) => prev.filter((i) => i.product.id !== id))
        }
        onCheckout={() => {
          alert("Proceeding to checkout...");
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />
    </div>
  );
}
