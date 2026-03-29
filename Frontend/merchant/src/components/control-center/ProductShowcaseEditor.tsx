"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Icon, Input, Select } from "@vayva/ui";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Spinner as Loader2,
  MagnifyingGlass as Search,
  X,
  Check,
} from "@phosphor-icons/react/ssr";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ShowcaseConfig {
  mode: "auto" | "manual";
  autoStrategy: "newest" | "bestselling" | "random" | "discounted";
  limit: number;
  productIds: string[];
}

interface ProductShowcaseEditorProps {
  onConfigChange: (config: ShowcaseConfig) => void;
}

const AUTO_STRATEGIES = [
  {
    value: "newest",
    label: "Newest First",
    description: "Show your most recently added products",
  },
  {
    value: "bestselling",
    label: "Best Sellers",
    description: "Show products with the most orders",
  },
  {
    value: "discounted",
    label: "On Sale",
    description: "Show products with discounts",
  },
  {
    value: "random",
    label: "Random Mix",
    description: "Show a random selection each time",
  },
];

import { apiJson } from "@/lib/api-client-shared";

interface ShowcaseResponse {
  config: ShowcaseConfig;
  availableProducts: Product[];
}

export const ProductShowcaseEditor = ({
  onConfigChange,
}: ProductShowcaseEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ShowcaseConfig>({
    mode: "auto",
    autoStrategy: "newest",
    limit: 8,
    productIds: [],
  });
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadShowcaseData();
  }, []);

  const loadShowcaseData = async () => {
    try {
      setLoading(true);
      const data = await apiJson<ShowcaseResponse>("/storefront/showcase");

      setConfig(data.config);
      setAvailableProducts(data.availableProducts || []);

      // Set selected products based on saved productIds
      if (data.config?.productIds && data.config?.productIds.length > 0) {
        const selected = data.config?.productIds
          .map((id: string) =>
            (data.availableProducts || []).find((p: Product) => p.id === id),
          )
          .filter((p: any): p is Product => Boolean(p));
        setSelectedProducts(selected);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_SHOWCASE_DATA_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load showcase settings");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: ShowcaseConfig) => {
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>("/storefront/showcase", {
        method: "PATCH",
        body: JSON.stringify(newConfig),
      });
      onConfigChange(newConfig);
      toast.success("Showcase settings saved!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_SHOWCASE_CONFIG_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = (mode: "auto" | "manual") => {
    const newConfig = { ...config, mode };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleStrategyChange = (
    autoStrategy: ShowcaseConfig["autoStrategy"],
  ) => {
    const newConfig = { ...config, autoStrategy };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleLimitChange = (limit: number) => {
    const newConfig = { ...config, limit };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const addProduct = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) return;
    const newSelected = [...selectedProducts, product];
    setSelectedProducts(newSelected);
    const newConfig = { ...config, productIds: newSelected.map((p) => p.id) };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const removeProduct = (productId: string) => {
    const newSelected = selectedProducts.filter((p) => p.id !== productId);
    setSelectedProducts(newSelected);
    const newConfig = { ...config, productIds: newSelected.map((p) => p.id) };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const onDragEnd = (result: {
    source: { index: number };
    destination: { index: number } | null;
  }) => {
    if (!result.destination) return;
    const items = Array.from(selectedProducts);
    const [reorderedItem] = items.splice(result.source?.index, 1);
    items.splice(result.destination?.index, 0, reorderedItem);
    setSelectedProducts(items);
    const newConfig = { ...config, productIds: items.map((p) => p.id) };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedProducts.find((s) => s.id === p.id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 block">
          Display Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={() => handleModeChange("auto")}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              config.mode === "auto"
                ? "border-black bg-white/40"
                : "border-gray-100 hover:border-gray-100"
            }`}
          >
            <Icon name="Sparkles" size={16} className="mb-1" />
            <p className="text-xs font-bold">Auto</p>
            <p className="text-[10px] text-gray-400">Smart selection</p>
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleModeChange("manual")}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              config.mode === "manual"
                ? "border-black bg-white/40"
                : "border-gray-100 hover:border-gray-100"
            }`}
          >
            <Icon name="Hand" size={16} className="mb-1" />
            <p className="text-xs font-bold">Manual</p>
            <p className="text-[10px] text-gray-400">Pick products</p>
          </Button>
        </div>
      </div>

      {/* Auto Mode Options */}
      {config.mode === "auto" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">
              Strategy
            </label>
            <div className="space-y-2">
              {AUTO_STRATEGIES.map((strategy) => (
                <Button
                  variant="ghost"
                  key={strategy.value}
                  onClick={() =>
                    handleStrategyChange(
                      strategy.value as ShowcaseConfig["autoStrategy"],
                    )
                  }
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    config.autoStrategy === strategy.value
                      ? "border-black bg-white/40"
                      : "border-gray-100 hover:border-gray-100"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      config.autoStrategy === strategy.value
                        ? "border-black"
                        : "border-gray-100"
                    }`}
                  >
                    {config.autoStrategy === strategy.value && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{strategy.label}</p>
                    <p className="text-[10px] text-gray-400">
                      {strategy.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">
              Products to Show
            </label>
            <Select
              value={config.limit}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLimitChange(Number(e.target?.value))}
              className="w-full text-sm border border-gray-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value={4}>4 products</option>
              <option value={6}>6 products</option>
              <option value={8}>8 products</option>
              <option value={12}>12 products</option>
              <option value={16}>16 products</option>
            </Select>
          </div>
        </div>
      )}

      {/* Manual Mode - Product Picker */}
      {config.mode === "manual" && (
        <div className="space-y-4">
          {/* Selected Products */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">
              Selected Products ({selectedProducts.length})
            </label>

            {selectedProducts.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-400">
                  No products selected yet
                </p>
                <p className="text-[10px] text-gray-400">
                  Search and add products below
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selected-products">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {selectedProducts.map((product: any, index: number) => (
                        <Draggable
                          key={product.id}
                          draggableId={product.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg shadow-sm"
                            >
                              <Icon
                                name="GripVertical"
                                size={12}
                                className="text-gray-400"
                              />
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-white/40 flex items-center justify-center">
                                  <Icon
                                    name="Package"
                                    size={12}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {product.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  ₦{product?.price?.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => removeProduct(product.id)}
                                className="p-1 hover:bg-white/40 rounded"
                              >
                                <X size={12} className="text-gray-400" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Product Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">
              Add Products
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target?.value)}
                placeholder="Search products..."
                className="w-full text-sm border border-gray-100 rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-black outline-none"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  {searchQuery ? "No products found" : "All products selected"}
                </p>
              ) : (
                filteredProducts.slice(0, 10).map((product) => (
                  <Button
                    variant="ghost"
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white/40 rounded-lg transition-colors"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-white/40 flex items-center justify-center">
                        <Icon
                          name="Package"
                          size={12}
                          className="text-gray-400"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ₦{product?.price?.toLocaleString()}
                      </p>
                    </div>
                    <Icon
                      name="Plus"
                      size={14}
                      className="text-gray-400"
                    />
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {saving && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 size={12} className="animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
};
