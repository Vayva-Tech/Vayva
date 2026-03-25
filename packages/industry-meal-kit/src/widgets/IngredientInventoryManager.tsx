"use client";

import React, { useState, useEffect } from "react";
import { Badge, Card, CardContent, CardHeader, Progress, Button } from "@vayva/ui";
interface IngredientItem {
  productId: string;
  productName: string;
  currentStock: number;
  requiredQuantity: number;
  unit: string;
  lowStockThreshold: number;
}

interface IngredientInventoryManagerProps {
  storeId: string;
  weekStartDate?: Date;
  onRestockRequest?: (items: { productId: string; quantity: number }[]) => void;
}

export function IngredientInventoryManager({
  storeId,
  weekStartDate,
  onRestockRequest,
}: IngredientInventoryManagerProps) {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockItems, setRestockItems] = useState<
    { productId: string; quantity: number }[]
  >([]);

  useEffect(() => {
    void fetchInventory();
  }, [storeId, weekStartDate]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const qs = weekStartDate
        ? `&weekStart=${weekStartDate.toISOString()}`
        : "";
      const response = await fetch(
        `/api/meal-kit/inventory/check?storeId=${storeId}${qs}`
      );

      if (response.ok) {
        const data = (await response.json()) as IngredientItem[];
        setIngredients(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (ingredient: IngredientItem) => {
    const percentage =
      ingredient.requiredQuantity > 0
        ? (ingredient.currentStock / ingredient.requiredQuantity) * 100
        : 100;

    if (ingredient.currentStock === 0) {
      return {
        status: "critical",
        variant: "error" as const,
        message: "Out of stock",
        pct: 0,
      };
    }

    if (ingredient.currentStock < ingredient.lowStockThreshold) {
      return {
        status: "low",
        variant: "error" as const,
        message: "Low stock",
        pct: Math.min(100, percentage),
      };
    }

    if (percentage < 50) {
      return {
        status: "warning",
        variant: "warning" as const,
        message: `${Math.round(percentage)}% remaining`,
        pct: Math.min(100, percentage),
      };
    }

    return {
      status: "good",
      variant: "success" as const,
      message: "In stock",
      pct: Math.min(100, percentage),
    };
  };

  const toggleRestockItem = (productId: string) => {
    const exists = restockItems.find((item) => item.productId === productId);

    if (exists) {
      setRestockItems(
        restockItems.filter((item) => item.productId !== productId)
      );
    } else {
      const ingredient = ingredients.find((i) => i.productId === productId);
      const qty = ingredient
        ? Math.max(0, ingredient.requiredQuantity - ingredient.currentStock)
        : 0;
      setRestockItems([...restockItems, { productId, quantity: qty || 1 }]);
    }
  };

  const submitRestock = () => {
    if (restockItems.length > 0) {
      onRestockRequest?.(restockItems);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Ingredient inventory</h3>
        <p className="text-sm text-gray-600">
          Stock vs planned meal-kit requirements
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading inventory…</p>
        ) : ingredients.length === 0 ? (
          <p className="text-sm text-gray-500">No ingredient data.</p>
        ) : (
          <ul className="space-y-4">
            {ingredients.map((ing) => {
              const st = getStockStatus(ing);
              const selected = restockItems.some((r) => r.productId === ing.productId);
              return (
                <li
                  key={ing.productId}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{ing.productName}</span>
                    <Badge variant={st.variant}>{st.message}</Badge>
                  </div>
                  <p className="mb-2 text-xs text-gray-600">
                    {ing.currentStock} / {ing.requiredQuantity} {ing.unit}
                  </p>
                  <Progress value={st.pct} className="h-2" />
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      className={`rounded-lg border px-3 py-1 text-sm ${
                        selected
                          ? "border-gray-400 bg-gray-100"
                          : "border-gray-300 bg-white"
                      }`}
                      onClick={() => toggleRestockItem(ing.productId)}
                    >
                      {selected ? "Remove from restock" : "Queue restock"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {restockItems.length > 0 ? (
          <Button
            type="button"
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
            onClick={submitRestock}
          >
            Request restock ({restockItems.length} items)
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
