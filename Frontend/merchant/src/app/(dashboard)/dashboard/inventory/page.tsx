// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button, Icon } from "@vayva/ui";
import { logger } from "@vayva/shared";
import { Package, AlertTriangle, TrendingUp, ClipboardList } from "@phosphor-icons/react";
import { toast } from "sonner";
import Link from "next/link";
import { BulkActions, bulkExportAction } from "@/components/BulkActions";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { PERMISSIONS } from "@/lib/team/permissions";

import { InventoryProduct, InventoryApiResponse } from "@/types/inventory";
import { formatCurrency } from "@vayva/shared";
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

  // Calculate summary metrics from inventory
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => (p.inventory?.quantity || 0) > 5).length;
  const lowStockProducts = products.filter((p) => {
    const qty = p.inventory?.quantity || 0;
    return qty > 0 && qty <= 5;
  }).length;
  const outOfStockProducts = products.filter((p) => (p.inventory?.quantity || 0) === 0).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.inventory?.quantity || 0),
    0
  );

  return (
    <PermissionGate permission={PERMISSIONS.PRODUCTS_VIEW}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage stock levels</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
              onClick={() => window.open("/dashboard/products/new", "_blank")}
            >
              <Icon name="Plus" size={16} className="mr-2 text-gray-400" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Summary Widgets - Following spec Section 5.4 */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryWidget
              icon={<ClipboardList size={18} />}
              label="Total Products"
              value={String(totalProducts)}
              trend="+12%"
              positive
            />
            <SummaryWidget
              icon={<Package size={18} />}
              label="In Stock"
              value={String(inStockProducts)}
              trend="+8%"
              positive
            />
            <SummaryWidget
              icon={<AlertTriangle size={18} />}
              label="Low Stock"
              value={String(lowStockProducts)}
              trend="-3%"
              positive={false}
            />
            <SummaryWidget
              icon={<TrendingUp size={18} />}
              label="Inventory Value"
              value={formatCurrency(totalInventoryValue, "NGN")}
              trend="+15%"
              positive
            />
          </div>
        )}

        {/* Main Content */}
        {products.length === 0 ? (
          <div className="max-w-3xl mx-auto py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No inventory tracked
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Track stock levels to avoid overselling. Enable inventory tracking on your products.
              </p>
              <Link href="/dashboard/menu-items/new">
                <Button className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-8">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-6">
                <button className="text-sm font-medium border-b-2 border-green-500 text-green-600 pb-3 -mb-3.5 transition-colors">
                  All Products
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  In Stock
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Low Stock
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Out of Stock
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="Filter" size={14} />
                  Filter
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
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

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        title="Select all products"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        checked={
                          selectedIds.length === products.length &&
                          products.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-medium">Product Name</th>
                    <th className="px-6 py-4 text-left font-medium">Stock</th>
                    <th className="px-6 py-4 text-left font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const stock = p.inventory?.quantity || 0;
                    const lowStock = stock > 0 && stock <= 5;
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            title={`Select ${p.name}`}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.id)}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {stock} units
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              stock === 0
                                ? "bg-red-50 text-red-600"
                                : lowStock
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-green-50 text-green-600"
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
                            <button
                              onClick={() => handleAction("Retry", p)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Retry Stock Sync"
                            >
                              <Icon name="Refresh" size={16} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleAction("Support Help", p)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Contact Support"
                            >
                              <Icon name="Headset" size={16} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PermissionGate>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{trend}</span>
        <span className="ml-1">{positive ? '↗' : '↘'}</span>
      </div>
    </div>
  );
}
