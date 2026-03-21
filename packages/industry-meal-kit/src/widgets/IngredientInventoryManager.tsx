'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Progress } from '@vayva/ui/components/ui/progress';
import { AlertTriangle, CheckCircle, Package, TrendingDown, RefreshCcw, Plus } from 'lucide-react';

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
  const [restockItems, setRestockItems] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    fetchInventory();
  }, [storeId, weekStartDate]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/meal-kit/inventory/check?storeId=${storeId}&weekStart=${weekStartDate?.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (ingredient: IngredientItem) => {
    const percentage = (ingredient.currentStock / ingredient.requiredQuantity) * 100;
    
    if (ingredient.currentStock === 0) {
      return { status: 'critical', color: 'destructive', message: 'Out of Stock' };
    }
    
    if (ingredient.currentStock < ingredient.lowStockThreshold) {
      return { status: 'low', color: 'destructive', message: 'Low Stock' };
    }
    
    if (percentage < 50) {
      return { status: 'warning', color: 'warning', message: `${Math.round(percentage)}% remaining` };
    }
    
    return { status: 'good', color: 'default', message: 'In Stock' };
  };

  const toggleRestockItem = (productId: string, productName: string) => {
    const exists = restockItems.find(item => item.productId === productId);
    
    if (exists) {
      setRestockItems(restockItems.filter(item => item.productId !== productId));
    } else {
      const ingredient = ingredients.find(i => i.productId === productId);
      if (ingredient) {
        const needed = ingredient.requiredQuantity - ingredient.currentStock;
        setRestockItems([...restockItems, { productId, quantity: needed }]);
      }
    }
  };

  const handleRestockRequest = () => {
    if (onRestockRequest && restockItems.length > 0) {
      onRestockRequest(restockItems);
      setRestockItems([]);
    }
  };

  const criticalItems = ingredients.filter(i => {
    const status = getStockStatus(i);
    return status.status === 'critical' || status.status === 'low';
  });

  const warningItems = ingredients.filter(i => {
    const status = getStockStatus(i);
    return status.status === 'warning';
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ingredient Inventory
            </CardTitle>
            <CardDescription>
              Monitor and manage ingredient stock levels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchInventory}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {restockItems.length > 0 && (
              <Button onClick={handleRestockRequest} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Restock ({restockItems.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={criticalItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-8 w-8 ${criticalItems.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl font-bold">{criticalItems.length}</p>
                  <p className="text-sm text-muted-foreground">Critical Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={warningItems.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className={`h-8 w-8 ${warningItems.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl font-bold">{warningItems.length}</p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{ingredients.length - criticalItems.length - warningItems.length}</p>
                  <p className="text-sm text-muted-foreground">Well Stocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No inventory data available</div>
        ) : (
          <div className="space-y-3">
            {/* Critical Items First */}
            {criticalItems.map(ingredient => {
              const status = getStockStatus(ingredient);
              const isSelected = restockItems.some(item => item.productId === ingredient.productId);

              return (
                <Card key={ingredient.productId} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRestockItem(ingredient.productId, ingredient.productName)}
                          className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <h4 className="font-semibold text-red-900">{ingredient.productName}</h4>
                          <p className="text-xs text-red-700">Required: {ingredient.requiredQuantity} {ingredient.unit}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{status.message}</Badge>
                    </div>
                    <Progress 
                      value={(ingredient.currentStock / ingredient.requiredQuantity) * 100} 
                      className="h-2 bg-red-100"
                    />
                    <p className="text-xs text-red-700 mt-1">
                      Current: {ingredient.currentStock} {ingredient.unit}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Warning Items */}
            {warningItems.map(ingredient => {
              const status = getStockStatus(ingredient);
              const percentage = (ingredient.currentStock / ingredient.requiredQuantity) * 100;
              const isSelected = restockItems.some(item => item.productId === ingredient.productId);

              return (
                <Card key={ingredient.productId} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRestockItem(ingredient.productId, ingredient.productName)}
                          className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <div>
                          <h4 className="font-semibold">{ingredient.productName}</h4>
                          <p className="text-xs text-muted-foreground">Required: {ingredient.requiredQuantity} {ingredient.unit}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-700">{status.message}</Badge>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-yellow-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {ingredient.currentStock} {ingredient.unit} ({Math.round(percentage)}%)
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Good Stock Items */}
            {ingredients
              .filter(i => {
                const status = getStockStatus(i);
                return status.status === 'good';
              })
              .map(ingredient => {
                const percentage = (ingredient.currentStock / ingredient.requiredQuantity) * 100;

                return (
                  <Card key={ingredient.productId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{ingredient.productName}</h4>
                          <p className="text-xs text-muted-foreground">Required: {ingredient.requiredQuantity} {ingredient.unit}</p>
                        </div>
                        <Badge variant="outline" className="text-emerald-700 border-emerald-700">
                          In Stock
                        </Badge>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2 bg-emerald-100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {ingredient.currentStock} {ingredient.unit} ({Math.round(percentage)}%)
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Restock Summary */}
        {restockItems.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Restock Request Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {restockItems.map((item, idx) => {
                  const ingredient = ingredients.find(i => i.productId === item.productId);
                  return (
                    <li key={idx} className="flex justify-between">
                      <span>{ingredient?.productName}</span>
                      <span className="font-medium">{item.quantity} {ingredient?.unit}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
