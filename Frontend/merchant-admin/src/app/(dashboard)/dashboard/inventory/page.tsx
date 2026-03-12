"use client";

import { Button, EmptyState, Input } from "@vayva/ui";
import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import {
  ArrowCounterClockwise as RefreshCw,
  Phone,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { BulkActions, bulkExportAction } from "@/components/BulkActions";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { PERMISSIONS } from "@/lib/team/permissions";

import { InventoryProduct, InventoryApiResponse } from "@/types/inventory";

import { apiJson } from "@/lib/api-client-shared";

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleAction = async (
    action: "Retry" | "Support Help",
    product: InventoryProduct,
  ) => {
    const toastId = toast.loading(`${action} initiating...`);
    try {
      await apiJson<{ success: boolean }>("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          type: "INVENTORY_ISSUE",
          subject: `${action}: ${product.name}`,
          description: `Support request for ${product.name} (ID: ${product.id}). Stock: ${product.inventory?.quantity || 0}`,
          priority: "medium",
          metadata: { productId: product.id },
        }),
      });
      toast.success(`${action} request logged with support.`, { id: toastId });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[INVENTORY_ACTION_ERROR] ${action}`, {
        error: _errMsg,
        productId: product.id,
        app: "merchant",
      });
      toast.error(`Failed to ${action.toLowerCase()} inventory`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkExport = () => {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Product Name,Stock,Status\n" +
      selectedProducts
        .map(
          (p) =>
            `${p.name},${p.inventory?.quantity || 0},${(p.inventory?.quantity || 0) === 0 ? "Out of Stock" : "In Stock"}`,
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body?.appendChild(link);
    link.click();
    document.body?.removeChild(link);
    toast.success(`Exported ${selectedIds.length} items`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiJson<InventoryApiResponse>("/api/products/items");
        if (!data) {
          setProducts([]);
          return;
        }

        // Handle new API response structure { data: [...], meta: {...} }
        if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data.items && Array.isArray(data.items)) {
          setProducts(data.items);
        } else {
          setProducts([]);
        }
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.warn("[FETCH_INVENTORY_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchProducts();
  }, []);

  if (loading) return <div className="p-6">Loading inventory...</div>;

  if (products.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Inventory</h1>
        <EmptyState
          title="No inventory tracked"
          icon="Boxes"
          description="Track stock levels to avoid overselling. Enable inventory tracking on your products."
          action={
            <Link href="/dashboard/menu-items/new">
              <Button variant="outline" className="px-8">
                Add Product
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <PermissionGate permission={PERMISSIONS.PRODUCTS_VIEW}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Inventory</h1>

        <BulkActions
          selectedCount={selectedIds.length}
          totalCount={products.length}
          allSelected={
            selectedIds.length === products.length && products.length > 0
          }
          onSelectAll={handleSelectAll}
          onDeselectAll={() => setSelectedIds([])}
          actions={[bulkExportAction(handleBulkExport)]}
        />

        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/30 text-text-tertiary font-medium border-b border-border/40">
              <tr>
                <th className="px-6 py-4 w-12">
                  <Input type="checkbox"
                    title="Select all products"
                    className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                    checked={
                      selectedIds.length === products.length &&
                      products.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {products.map((p) => {
                const stock = p.inventory?.quantity || 0;
                const lowStock = stock < 5;
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-background/30 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <Input type="checkbox"
                        title={`Select ${p.name}`}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                        checked={isSelected}
                        onChange={() => handleSelectOne(p.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-text-primary">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {stock} units
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          stock === 0
                            ? "bg-red-100 text-red-700"
                            : lowStock
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {stock === 0
                          ? "Out of Stock"
                          : lowStock
                            ? "Low Stock"
                            : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAction("Retry", p)}
                          className="text-text-tertiary hover:text-indigo-600 hover:bg-background/30 border-border h-8 w-8"
                          title="Retry Stock Sync"
                        >
                          <RefreshCw size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAction("Support Help", p)}
                          className="text-text-tertiary hover:text-indigo-600 hover:bg-background/30 border-border h-8 w-8"
                          title="Contact Support"
                        >
                          <Phone size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PermissionGate>
  );
}
