"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, GlassPanel, Icon, Input } from "@vayva/ui";
import { CalendarSyncSettings } from "./products/calendar-sync-settings";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    status?: string;
    sku?: string;
    inventory?: number;
    calendarSyncs?: unknown[];
  };
  isEdit?: boolean;
}

export const ProductForm = ({
  initialData,
  isEdit = false,
}: ProductFormProps) => {
  const router = useRouter();
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>(
    [],
  );
  const [variants, setVariants] = useState<
    { name: string; price?: number; inventory?: number; sku?: string }[]
  >([]);

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState("");

  const handleAddOption = () => {
    if (!newOptionName || !newOptionValues) return;
    const values = newOptionValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const newOptions = [...options, { name: newOptionName, values }];
    setOptions(newOptions);
    setNewOptionName("");
    setNewOptionValues("");
    generateVariants(newOptions);
  };

  const removeOption = (idx: number) => {
    const newOptions = [...options];
    newOptions.splice(idx, 1);
    setOptions(newOptions);
    generateVariants(newOptions);
  };

  const generateVariants = (opts: typeof options) => {
    if (opts.length === 0) {
      setVariants([]);
      return;
    }

    // Cartesian Product
    const cartesian = (sets: string[][]) => {
      return sets.reduce<string[][]>(
        (acc, set) => {
          return acc.flatMap((x) => set.map((y) => [...x, y]));
        },
        [[]],
      );
    };

    const combinations = cartesian(opts.map((o) => o.values));
    const newVariants = combinations.map((combo) => ({
      name: combo.join(" / "),
      price: initialData?.price,
      inventory: 0,
      sku: "",
    }));
    setVariants(newVariants);
  };

  const updateVariant = (
    idx: number,
    field: string,
    value: string | number,
  ) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  // Test save
  const handleSave = () => {
    // Logic would go here
    router.push("/dashboard/products");
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      {/* Sticky Action Bar */}
      <div className="flex items-center justify-between sticky top-[80px] z-30 py-4 bg-[#142210]/95 backdrop-blur-xl border-b border-white/5 -mx-6 px-6 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-none sm:backdrop-blur-none sm:static">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
          {isEdit && (
            <p className="text-text-secondary text-sm">
              Last saved a few minutes ago
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Discard
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? "Save Changes" : "Save Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Media */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Media</h3>
            <div className="border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-background/5 transition-colors cursor-pointer">
              <Icon
                name="ImagePlus"
                size={32}
                className="text-text-secondary mb-2"
              />
              <p className="text-sm font-bold text-white">Add images</p>
              <p className="text-xs text-text-secondary">
                Drag and drop or click to upload
              </p>
            </div>
          </GlassPanel>

          {/* Basic Info */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Basic Info</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Product Name
                </label>
                <Input
                  id="product-name"
                  aria-label="Product Name"
                  defaultValue={initialData?.name}
                  placeholder="e.g. Nike Air Max 90"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Description
                </label>
                <textarea
                  className="w-full bg-background/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-primary transition-colors min-h-[120px]"
                  defaultValue={initialData?.description}
                  placeholder="Describe your product..."
                  aria-label="Description"
                ></textarea>
              </div>
            </div>
          </GlassPanel>

          {/* Variants Toggle */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Variants</h3>
                <p className="text-sm text-text-secondary">
                  Does this product have options like size or color?
                </p>
              </div>
              <input
                id="variant-toggle"
                type="checkbox"
                className="toggle toggle-primary"
                checked={hasVariants}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHasVariants(e.target.checked)
                }
                aria-label="Enable variants"
              />
            </div>

            {hasVariants && (
              <div className="mt-6 pt-6 border-t border-white/5 space-y-6">
                {/* Option Builder */}
                <div className="space-y-4">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="bg-background/5 p-4 rounded-xl border border-white/10"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-white">{opt.name}</span>
                        <Button
                          variant="link"
                          onClick={() => removeOption(idx)}
                          className="text-xs text-red-400 hover:text-red-300 h-auto p-0"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val, vIdx) => (
                          <span
                            key={vIdx}
                            className="bg-background/10 px-2 py-1 rounded text-xs text-white border border-white/10"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                        Option Name
                      </label>
                      <Input
                        placeholder="e.g. Size"
                        value={newOptionName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewOptionName(e.target.value)
                        }
                        aria-label="New Option Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                        Option Values
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Small, Medium (comma separated)"
                          value={newOptionValues}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewOptionValues(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOption();
                            }
                          }}
                          aria-label="New Option Values"
                        />
                        <Button
                          onClick={handleAddOption}
                          disabled={!newOptionName || !newOptionValues}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Variants Table */}
                {variants.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm text-white">
                      <thead className="bg-background/5 uppercase text-xs text-text-secondary font-bold">
                        <tr>
                          <th className="p-3">Variant</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">SKU</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {variants.map((variant, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-background/5 transition-colors"
                          >
                            <td className="p-3 font-medium">{variant.name}</td>
                            <td className="p-3">
                              <Input
                                className="h-8 w-24 text-right font-mono"
                                defaultValue={initialData?.price || 0}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                  updateVariant(idx, "price", e.target.value)
                                }
                                aria-label={`Price for ${variant.name}`}
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                className="h-8 w-20 text-right font-mono"
                                defaultValue={0}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                  updateVariant(
                                    idx,
                                    "inventory",
                                    e.target.value,
                                  )
                                }
                                aria-label={`Stock for ${variant.name}`}
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                className="h-8 w-32 font-mono text-xs"
                                placeholder="SKU"
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => updateVariant(idx, "sku", e.target.value)}
                                aria-label={`SKU for ${variant.name}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Status */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Status</h3>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="radio"
                  name="status"
                  id="status-active"
                  className="radio radio-primary"
                  defaultChecked={initialData?.status === "active"}
                  aria-label="Set status to Active"
                />
                <span className="label-text text-white">Active</span>
              </label>
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="radio"
                  name="status"
                  id="status-draft"
                  className="radio radio-primary"
                  defaultChecked={initialData?.status !== "active"}
                  aria-label="Set status to Draft"
                />
                <span className="label-text text-white">Draft</span>
              </label>
            </div>
          </GlassPanel>

          {/* Pricing */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Pricing</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Price (₦)
                </label>
                <Input
                  defaultValue={initialData?.price}
                  placeholder="0.00"
                  className="font-mono text-lg"
                  aria-label="Price"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                    Cost
                  </label>
                  <Input placeholder="0.00" aria-label="Cost" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                    Profit
                  </label>
                  <div className="h-12 flex items-center px-4 text-text-secondary text-sm border border-transparent">
                    --
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Inventory */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Inventory</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  SKU (Optional)
                </label>
                <Input defaultValue={initialData?.sku} aria-label="SKU" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Track quantity</span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  defaultChecked
                  aria-label="Track quantity"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Available Quantity
                </label>
                <Input
                  type="number"
                  defaultValue={initialData?.inventory || 0}
                  aria-label="Available Quantity"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Organization */}
          <GlassPanel className="p-6">
            <h3 className="font-bold text-white mb-4">Organization</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Category
                </label>
                <select
                  className="h-12 w-full rounded-full bg-background/5 border border-white/10 px-4 text-white outline-none focus:border-primary"
                  aria-label="Category"
                >
                  <option>Select...</option>
                  <option>Apparel</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-2 block">
                  Collections
                </label>
                <Input
                  placeholder="Search collections..."
                  aria-label="Collections"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Availability / Calendar Sync (Edit Mode Only) */}
          {isEdit && initialData?.id && (
            <GlassPanel className="p-6">
              <h3 className="font-bold text-white mb-4">Availability Sync</h3>
              <p className="text-xs text-text-secondary mb-4">
                Connect external calendars (Airbnb, Booking.com) to prevent
                double bookings.
              </p>
              <CalendarSyncSettings
                productId={initialData.id}
                initialSyncs={
                  Array.isArray(initialData.calendarSyncs)
                    ? initialData.calendarSyncs.map((sync) => {
                        const s = sync as Record<string, unknown>;
                        return {
                          id: String(s.id ?? ""),
                          name: String(s.name ?? ""),
                          url: String(s.url ?? ""),
                          lastSyncedAt:
                            typeof s.lastSyncedAt === "string"
                              ? s.lastSyncedAt
                              : null,
                          syncStatus: String(s.syncStatus ?? "PENDING"),
                          error: typeof s.error === "string" ? s.error : null,
                        };
                      })
                    : []
                }
              />
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};
