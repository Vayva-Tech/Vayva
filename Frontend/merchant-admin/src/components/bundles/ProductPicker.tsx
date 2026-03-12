"use client";

import { logger, formatCurrency } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import {
  MagnifyingGlass as Search,
  Spinner as Loader2,
  Package,
} from "@phosphor-icons/react/ssr";
import { Checkbox, Input } from "@vayva/ui";

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
  status: string;
}

interface ProductPickerProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

import { apiJson } from "@/lib/api-client-shared";

export function ProductPicker({
  selectedIds,
  onSelectionChange,
}: ProductPickerProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Product[]>(
        "/api/products/items?status=active",
      );
      setProducts(data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_PRODUCTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="pl-9"
        />
      </div>

      <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            {search
              ? "No products match your search"
              : "No active products found"}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(product.price)} • {product.inventory} in
                    stock
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded">
          {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""}{" "}
          selected
        </div>
      )}
    </div>
  );
}
