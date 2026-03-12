"use client";

import { useState } from "react";
import { Button, Input } from "@vayva/ui";
import { toast } from "sonner";
import { Spinner as Loader2, Check } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { logger } from "@vayva/shared";

interface Product {
  id: string;
  name: string;
  price: number;
  status: string;
  currency: string;
}

interface BulkProductTableProps {
  initialProducts: Product[];
}

import { apiJson } from "@/lib/api-client-shared";

interface BulkUpdateResponse {
  message?: string;
  success: boolean;
}

export function BulkProductTable({ initialProducts }: BulkProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [edits, setEdits] = useState<Record<string, Partial<Product>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    id: string,
    field: keyof Product,
    value: string | number,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? ({ ...p, [field]: value } as Product) : p,
      ),
    );
  };

  const hasChanges = Object.keys(edits).length > 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const itemsToUpdate = Object.entries(edits).map(([id, changes]) => ({
        id,
        data: changes,
      }));

      const result = await apiJson<BulkUpdateResponse>("/api/products/bulk", {
        method: "PATCH",
        body: JSON.stringify({ items: itemsToUpdate }),
      });

      toast.success(result.message || "Products updated");
      setEdits({});
      router.refresh();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[BULK_PRODUCT_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setProducts(initialProducts);
    setEdits({});
    toast.info("Changes discarded");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <div className="flex items-center gap-2 text-yellow-800">
          <span className="font-semibold">Bulk Edit Mode</span>
          <span className="text-sm">
            • {Object.keys(edits).length} unsaverd changes
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscard}
            disabled={!hasChanges || isSaving}
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-background rounded-xl shadow-sm border border-border/40 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/40 text-text-tertiary font-medium border-b border-border/40">
            <tr>
              <th className="px-6 py-4 w-[40%]">Product Name</th>
              <th className="px-6 py-4 w-[20%]">Price</th>
              <th className="px-6 py-4 w-[20%]">Status</th>
              <th className="px-6 py-4 w-[20%]">Currency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {products.map((p) => {
              const isDirty = !!edits[p.id];
              return (
                <tr
                  key={p.id}
                  className={`transition-colors ${isDirty ? "bg-blue-50/50" : "hover:bg-white/40"}`}
                >
                  <td className="px-6 py-3">
                    <Input
                      value={p.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(p.id, "name", e.target.value)
                      }
                      className="h-8 bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <Input
                      type="number"
                      value={p.price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(p.id, "price", e.target.value)
                      }
                      className="h-8 bg-transparent border-transparent hover:border-border focus:bg-background"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <select
                      aria-label="Status"
                      value={p.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleChange(p.id, "status", e.target.value)
                      }
                      className="h-8 bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-text-tertiary">{p.currency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
