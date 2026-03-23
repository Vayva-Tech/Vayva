// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardPageShell } from '@/components/layout/DashboardPageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  Calendar, 
  Package, 
  Heart, 
  TrendingUp, 
  Users,
  DollarSign,
  AlertCircle,
  Plus,
  ChefHat,
  Truck
} from 'lucide-react';
// Lazy-load meal kit widgets — the package may not export them from the "widgets" entry
// so we use dynamic stubs that render placeholders when unavailable
const WeeklyRecipeSelector = (props: any) => <div className="p-4 border rounded-lg text-gray-500 text-center">Weekly Recipe Selector (coming soon)</div>;
const SubscriptionPlanBuilder = (props: any) => <div className="p-4 border rounded-lg text-gray-500 text-center">Subscription Plan Builder (coming soon)</div>;
const DeliverySlotPicker = (props: any) => <div className="p-4 border rounded-lg text-gray-500 text-center">Delivery Slot Picker (coming soon)</div>;
const MealPreferenceTracker = (props: any) => <div className="p-4 border rounded-lg text-gray-500 text-center">Meal Preference Tracker (coming soon)</div>;
const IngredientInventoryManager = (props: any) => <div className="p-4 border rounded-lg text-gray-500 text-center">Ingredient Inventory Manager (coming soon)</div>;

export default function MealKitDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string>('');

  // Mock data - replace with real API calls
  const stats = {
    activeSubscriptions: 127,
    weeklyRevenue: 485000,
    recipesThisWeek: 12,
    pendingDeliveries: 23,
    lowStockIngredients: 5,
    customerSatisfaction: 94,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardPageShell
        title="🍱 Meal Kit Manager"
        description="Manage subscriptions, menus, and deliveries"
      >
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Subscriptions</p>
                    <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
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
                    <p className="text-sm text-gray-500">Weekly Revenue</p>
                    <p className="text-2xl font-bold">₦{(stats.weeklyRevenue / 1000).toFixed(0)}k</p>
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
                    <p className="text-sm text-gray-500">Recipes This Week</p>
                    <p className="text-2xl font-bold">{stats.recipesThisWeek}</p>
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
                    <p className="text-sm text-gray-500">Pending Deliveries</p>
                    <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('recipes')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Recipe
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('subscriptions')}>
                      <Package className="h-4 w-4 mr-2" />
                      Create Subscription
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('delivery')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Delivery
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('preferences')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Update Preferences
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Alerts & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">Low Stock Alert</p>
                          <p className="text-xs text-red-700">{stats.lowStockIngredients} ingredients need restocking</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">Upcoming Deliveries</p>
                          <p className="text-xs text-yellow-700">{stats.pendingDeliveries} deliveries scheduled for this week</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recipes Tab */}
            <TabsContent value="recipes">
              <WeeklyRecipeSelector
                storeId="store_123"
                weekStartDate={new Date()}
                selectedRecipes={selectedRecipes}
                onRecipeSelect={setSelectedRecipes}
                maxRecipes={5}
              />
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions">
              <SubscriptionPlanBuilder
                storeId="store_123"
                onPlanSelect={setSelectedPlan}
              />
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery">
              <DeliverySlotPicker
                storeId="store_123"
                customerZipCode="100001"
                selectedSlotId={selectedDeliverySlot}
                onSlotSelect={setSelectedDeliverySlot}
              />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <MealPreferenceTracker
                storeId="store_123"
                customerId="customer_456"
                onSave={(prefs) => {}}
              />
            </TabsContent>
          </Tabs>

          {/* Inventory Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ingredient Inventory
              </CardTitle>
              <CardDescription>
                Monitor and manage ingredient stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IngredientInventoryManager
                storeId="store_123"
                weekStartDate={new Date()}
                onRestockRequest={(items) => {}}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardPageShell>
    </motion.div>
  );
}
