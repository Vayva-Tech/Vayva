"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WeeklyRecipeSelector,
  SubscriptionPlanBuilder,
  DeliverySlotPicker,
  MealPreferenceTracker,
  IngredientInventoryManager,
} from "@vayva/industry-meal-kit";
import {
  Calendar,
  Package,
  Heart,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  Plus,
  ChefHat,
  Truck,
} from "lucide-react";

const MEAL_KIT_STATS_EMPTY = {
  activeCustomers7d: 0,
  revenue7d: 0,
  orders7d: 0,
  pendingDeliveries: 0,
  lowStockIngredients: 0,
};

export default function MealKitDashboardPage() {
  const { store } = useStore();
  const storeId = store?.id ?? "";

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string>("");
  const [deliveryZipCode, setDeliveryZipCode] = useState("");
  const [preferenceCustomerId, setPreferenceCustomerId] = useState("");
  const [stats, setStats] = useState(MEAL_KIT_STATS_EMPTY);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [overview, orderSummary] = await Promise.all([
        apiJson<{
          totalSales?: number;
          totalOrders?: number;
          activeCustomers?: number;
        }>("/api/analytics/overview?range=7d"),
        apiJson<{
          processing?: number;
          shipped?: number;
        }>("/api/orders/summary"),
      ]);

      let lowStock = 0;
      try {
        const inventory = await apiJson<{
          success?: boolean;
          data?: { summary?: { lowStockCount?: number } };
        }>("/api/beauty/inventory?lowStockOnly=true&limit=1&page=1");
        if (inventory.success && inventory.data?.summary?.lowStockCount != null) {
          lowStock = inventory.data.summary.lowStockCount;
        }
      } catch {
        /* optional: stores without beauty inventory BFF */
      }

      setStats({
        activeCustomers7d: overview.activeCustomers ?? 0,
        revenue7d: overview.totalSales ?? 0,
        orders7d: overview.totalOrders ?? 0,
        pendingDeliveries: (orderSummary.processing ?? 0) + (orderSummary.shipped ?? 0),
        lowStockIngredients: lowStock,
      });
    } catch {
      toast.error("Could not load meal kit dashboard stats");
      setStats(MEAL_KIT_STATS_EMPTY);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const weekStart = new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={statsLoading ? "opacity-60 pointer-events-none" : ""}
    >
      <DashboardPageShell
        title="Meal Kit Manager"
        description="Subscriptions, menus, and deliveries"
      >
        <div className="space-y-8">
          {!storeId ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              Store context is still loading. Meal kit tools need an active store.
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active customers (7d)</p>
                    <p className="text-2xl font-bold">{stats.activeCustomers7d}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue (7d)</p>
                    <p className="text-2xl font-bold">
                      ₦
                      {stats.revenue7d >= 1_000_000
                        ? `${(stats.revenue7d / 1_000_000).toFixed(1)}M`
                        : stats.revenue7d >= 1000
                          ? `${(stats.revenue7d / 1000).toFixed(0)}k`
                          : stats.revenue7d.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ChefHat className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid orders (7d)</p>
                    <p className="text-2xl font-bold">{stats.orders7d}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">In-flight fulfillment</p>
                    <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quick actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("recipes")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Recipes &amp; weekly menu
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("subscriptions")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Subscription plans
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("delivery")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Delivery slots
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("preferences")}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Customer preferences
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.lowStockIngredients > 0 ? (
                        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Low stock</p>
                            <p className="text-xs text-red-700">
                              {stats.lowStockIngredients} SKU
                              {stats.lowStockIngredients === 1 ? "" : "s"} below threshold (inventory)
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {stats.pendingDeliveries > 0 ? (
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-900">Fulfillment</p>
                            <p className="text-xs text-yellow-700">
                              {stats.pendingDeliveries} order
                              {stats.pendingDeliveries === 1 ? "" : "s"} processing or out for delivery
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {stats.lowStockIngredients === 0 && stats.pendingDeliveries === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No alerts right now.</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recipes">
              {storeId ? (
                <WeeklyRecipeSelector
                  storeId={storeId}
                  weekStartDate={weekStart}
                  selectedRecipes={selectedRecipes}
                  onRecipeSelect={setSelectedRecipes}
                  maxRecipes={5}
                />
              ) : (
                <p className="text-sm text-gray-500">Connect a store to manage recipes.</p>
              )}
            </TabsContent>

            <TabsContent value="subscriptions">
              {storeId ? (
                <SubscriptionPlanBuilder
                  storeId={storeId}
                  onPlanSelect={() => toast.message("Plan selected")}
                />
              ) : (
                <p className="text-sm text-gray-500">Connect a store to build plans.</p>
              )}
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              {storeId ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Delivery area</CardTitle>
                      <CardDescription>
                        Optional ZIP or postal code filters slots when your backend supports it.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Label htmlFor="meal-kit-delivery-zip">ZIP / postal code</Label>
                      <Input
                        id="meal-kit-delivery-zip"
                        value={deliveryZipCode}
                        onChange={(e) => setDeliveryZipCode(e.target.value.trim())}
                        placeholder="e.g. 101241"
                        autoComplete="postal-code"
                      />
                    </CardContent>
                  </Card>
                  <DeliverySlotPicker
                    storeId={storeId}
                    customerZipCode={deliveryZipCode}
                    selectedSlotId={selectedDeliverySlot}
                    onSlotSelect={setSelectedDeliverySlot}
                  />
                </>
              ) : (
                <p className="text-sm text-gray-500">Connect a store to schedule delivery.</p>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              {storeId ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer</CardTitle>
                      <CardDescription>
                        Enter the customer record ID from Customers (meal preferences are per customer).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Label htmlFor="meal-kit-customer-id">Customer ID</Label>
                      <Input
                        id="meal-kit-customer-id"
                        value={preferenceCustomerId}
                        onChange={(e) => setPreferenceCustomerId(e.target.value.trim())}
                        placeholder="e.g. cus_…"
                        autoComplete="off"
                      />
                    </CardContent>
                  </Card>
                  {preferenceCustomerId ? (
                    <MealPreferenceTracker
                      storeId={storeId}
                      customerId={preferenceCustomerId}
                      onSave={() => toast.success("Preferences saved")}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Enter a customer ID to edit meal preferences.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Connect a store to manage preferences.</p>
              )}
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ingredient inventory
              </CardTitle>
              <CardDescription>Stock levels tied to your meal-kit catalog</CardDescription>
            </CardHeader>
            <CardContent>
              {storeId ? (
                <IngredientInventoryManager
                  storeId={storeId}
                  weekStartDate={weekStart}
                  onRestockRequest={() => toast.message("Restock request recorded")}
                />
              ) : (
                <p className="text-sm text-gray-500">Connect a store to manage inventory.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardPageShell>
    </motion.div>
  );
}
