"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { logger, formatCurrency } from "@vayva/shared";
import { Button, Badge } from "@vayva/ui";
import { Plus, Package, Stack as Layers } from "@phosphor-icons/react/ssr";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  sku: string;
  moq: number;
  image: string | null;
  pricingTiers: { minQty: number; unitPrice: number }[];
}

import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface WholesaleProductsResponse {
  products: Product[];
}

export default function WholesaleCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiJson<WholesaleProductsResponse>(
        "/api/products?type=wholesale",
      );
      setProducts(data?.products || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_WHOLESALE_PRODUCTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Wholesale Catalog
          </h1>
          <p className="text-gray-500">
            Manage B2B products with volume pricing tiers.
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-vayva-green text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white  rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-black rounded-full mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">No products yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Add products with volume pricing for B2B customers.
            </p>
            <Link href="/dashboard/products/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.id}`}
                className="block p-4 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <Badge
                        variant={product.status?.toUpperCase() === "ACTIVE"
                            ? "success"
                            : "default"
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>SKU: {product.sku || "—"}</span>
                      <span>MOQ: {product.moq || 1}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(product.price, "NGN")}
                    </div>
                    {product.pricingTiers?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <Layers className="h-3 w-3" />
                        {product?.pricingTiers?.length} pricing tiers
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
