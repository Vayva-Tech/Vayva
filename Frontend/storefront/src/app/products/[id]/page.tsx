"use client";

import * as React from "react";
import { Button } from "@vayva/ui";
import { useEffect, useState } from "react";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct, ProductVariant } from "@/types/storefront";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PDPSkeleton } from "@/components/Skeletons";

import Image from "next/image";
import { FoodPDP } from "@/components/pdp/FoodPDP";
import { ServicePDP } from "@/components/pdp/ServicePDP";
import { ReportProductDialog } from "@/components/pdp/ReportProductDialog";
import { WhatsAppShare } from "@/components/WhatsAppShare";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductPage(_props: any): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const { store, addToCart } = useStore();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Track selections for each variant type (e.g. { "Size": "M", "Color": "Red" })
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (store && id) {
      const load = async () => {
        const data = await StorefrontService.getProduct(id);
        setProduct(data);
        setLoading(false);

        // Auto-select first options
        if (data && data.variants) {
          const defaults: Record<string, string> = {};
          (data.variants as ProductVariant[]).forEach((v) => {
            if ((v as any)?.options?.length > 0) defaults[v.name] = (v as any)?.options?.[0];
          });
          setSelections(defaults);
        }
      };
      load();
    }
  }, [store, id]);

  const handleSelection = (variantName: string, option: string) => {
    setSelections((prev) => ({ ...prev, [variantName]: option }));
  };

  if (!store) return <></>; // Handled by shell

  // Variant Rendering
  const industry = store.industry || "RETAIL";

  if (product && (industry.startsWith("FOOD") || industry === "RESTAURANT")) {
    return (
      <StoreShell>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <FoodPDP product={product} />
        </div>
      </StoreShell>
    );
  }

  if (
    product &&
    (industry === "SERVICES" || industry === "BEAUTY" || industry === "CLINIC")
  ) {
    return (
      <StoreShell>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ServicePDP product={product} />
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      {loading ? (
        <PDPSkeleton />
      ) : !product ? (
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link
            href={`/?store=${store.slug}`}
            className="text-blue-600 hover:underline"
          >
            Return Home
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative">
              <Image
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name || "Product"}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-400 uppercase tracking-widest">
                {product.category || "Product"}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl font-bold">
                ₦{(product as any)?.price?.toLocaleString()}
              </span>
            </div>

            <div className="prose text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </div>

            {/* Variants */}
            {(product.variants as ProductVariant[]).map((v) => (
              <div key={v.id} className="mb-6">
                <label className="block text-sm font-bold mb-2">{v.name}</label>
                <div className="flex gap-2">
                  {(v as any)?.options?.map((opt: any) => {
                    const isSelected = selections[v.name] === opt;
                    return (
                      <Button
                        key={opt}
                        onClick={() => handleSelection(v.name, opt)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-black"
                        }`}
                      >
                        {opt}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end mb-2">
              <WhatsAppShare
                text={`Check out ${product.name} on ${store.name}!`}
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100 flex-col sm:flex-row">
              {product.inventory === 0 || (product as any)?.trackInventory === false ? (
                <div className="w-full space-y-3">
                  <div className="rounded-md bg-amber-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-amber-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.485 (2 as any)?.495c?.673-1.167 2.357-1.167 3.03 0l6.28 (10 as any)?.875c?.673 1.167-.17 2.625-1.516 (2 as any)?.625H3?.72c-1.347 0-2.189-1.458-1.515-(2 as any)?.625L8?.485 2.495zM10 (5a as any)?.75?.75 0 (01 as any)?.75?.75v3.(5a as any)?.75?.75 0 01-1.5 0v-(3 as any)?.5A?.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Out of Stock
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>This item is currently unavailable.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      alert(
                        "You will be notified when this product is back in stock!",
                      )
                    }
                    className="w-full bg-background/70 backdrop-blur-xl text-black border-2 border-black h-14 rounded-full font-bold hover:bg-white/60 transition-colors"
                  >
                    Notify Me When Available
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    // Construct Variant ID from selections
                    const variantId =
                      Object.entries(selections)
                        .map(([k, v]: any[]) => `${k}:${v}`)
                        .sort()
                        .join(", ") || "default";

                    addToCart({
                      productId: product.id,
                      variantId: variantId,
                      quantity: 1,
                      price: product.price || 0,
                      productName: product.name || "Product",
                      image: product.images?.[0] || "/placeholder.png",
                    });
                    // Optional: Redirect / show toast
                    if (typeof window !== "undefined") window.location.href = `/cart?store=${store.slug}`;
                  }}
                  className="flex-1 bg-black text-white h-14 rounded-full font-bold hover:bg-gray-900 transition-colors"
                >
                  Add to Cart
                </Button>
              )}
            </div>

            <div className="mt-8 space-y-4 text-sm text-gray-500">
              <div className="flex gap-4">
                <span className="font-bold text-black min-w-[100px]">
                  Shipping
                </span>
                <span>Calculated at checkout.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-bold text-black min-w-[100px]">
                  Returns
                </span>
                <span>See our return policy for details.</span>
              </div>
            </div>

            <ReportProductDialog productId={product.id} />
          </div>
        </div>
      )}
    </StoreShell>
  );
}
