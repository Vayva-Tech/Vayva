"use client";

/**
 * Recipe Cost Dashboard UI Component
 * Food Industry - Operational Excellence Tools
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ChefHat,
  ShoppingCart,
  Calculator,
  ArrowRight,
  Package,
} from "lucide-react";
import type {
  Ingredient,
  Recipe,
  CostAnalysis,
  IngredientStockAlert,
  CreateIngredientRequest,
  CreateRecipeRequest,
  UnitType,
  IngredientCategory,
} from "@/types/recipe-cost";

interface RecipeCostDashboardProps {
  storeId: string;
  onError?: (error: Error) => void;
}

// ============================================================================
// Recipe Cost Dashboard Component
// ============================================================================

export function RecipeCostDashboard({ storeId, onError }: RecipeCostDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis[]>([]);
  const [stockAlerts, setStockAlerts] = useState<IngredientStockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real implementation, these would be API calls
      // const response = await fetch(`/api/recipe-cost/ingredients?storeId=${storeId}`);
      // const data = await response.json();
      // setIngredients(data);

      // For now, show empty states
      setIngredients([]);
      setRecipes([]);
      setCostAnalysis([]);
      setStockAlerts([]);
    } catch (error: unknown) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipe Cost Calculator</h1>
          <p className="text-gray-500">
            Track ingredient costs, calculate recipe profitability, and optimize pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddIngredient(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
          <Button onClick={() => setShowAddRecipe(true)}>
            <ChefHat className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
        </div>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stockAlerts.length} ingredient{stockAlerts.length > 1 ? "s" : ""} below minimum stock
            level{stockAlerts.length > 1 ? "s" : ""}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Ingredients"
          value={ingredients.length}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          title="Active Recipes"
          value={recipes.length}
          icon={<ChefHat className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Food Cost %"
          value={`${costAnalysis.length > 0
            ? Math.round(
                costAnalysis.reduce((sum: any, ca: any) => sum + ca.targetMargin, 0) /
                  costAnalysis.length
              )
            : 30}%`}
          icon={<Calculator className="h-4 w-4" />}
        />
        <StatsCard
          title="Price Recommendations"
          value={costAnalysis.filter((ca) => ca.recommendation === "increase_price").length}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            ingredients={ingredients}
            recipes={recipes}
            costAnalysis={costAnalysis}
            stockAlerts={stockAlerts}
          />
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4">
          <IngredientsTab
            ingredients={ingredients}
            isLoading={isLoading}
            onAdd={() => setShowAddIngredient(true)}
          />
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <RecipesTab
            recipes={recipes}
            isLoading={isLoading}
            onAdd={() => setShowAddRecipe(true)}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <PricingTab costAnalysis={costAnalysis} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Add Ingredient Dialog */}
      <AddIngredientDialog
        open={showAddIngredient}
        onOpenChange={setShowAddIngredient}
        storeId={storeId}
        onSuccess={fetchData}
      />

      {/* Add Recipe Dialog */}
      <AddRecipeDialog
        open={showAddRecipe}
        onOpenChange={setShowAddRecipe}
        storeId={storeId}
        ingredients={ingredients}
        onSuccess={fetchData}
      />
    </div>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge
                  variant={
                    trend === "up"
                      ? "default"
                      : trend === "down"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                </Badge>
              )}
            </div>
          </div>
          <div className="rounded-full bg-green-500/10 p-2 text-green-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Overview Tab
// ============================================================================

interface OverviewTabProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  costAnalysis: CostAnalysis[];
  stockAlerts: IngredientStockAlert[];
}

function OverviewTab({ recipes, stockAlerts, costAnalysis }: OverviewTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Recipes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recipes yet. Add your first recipe to start tracking costs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recipes.slice(0, 5).map((recipe) => (
                <div key={recipe.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-gray-500">
                      {recipe.ingredients.length} ingredients · ₦
                      {recipe.costPerPortion.toFixed(2)} per portion
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {costAnalysis.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No pricing data available. Add recipes and link them to menu items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {costAnalysis
                .filter((ca) => ca.recommendation === "increase_price")
                .slice(0, 5)
                .map((ca) => (
                  <div key={ca.recipeId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ca.recipeName}</p>
                      <p className="text-sm text-gray-500">
                        Current: ₦{ca.currentPrice?.toFixed(2) ?? "N/A"} · Suggested: ₦
                        {ca.suggestedPrice.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="default">+₦{ca.profitGap.toFixed(0)}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockAlerts.map((alert) => (
                <div
                  key={alert.ingredientId}
                  className="flex items-center justify-between p-3 bg-red-500 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-sm text-gray-500">
                      Current: {alert.currentStock} · Min: {alert.minStock} · Affects{" "}
                      {alert.recipesAffected.length} recipe(s)
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Ingredients Tab
// ============================================================================

interface IngredientsTabProps {
  ingredients: Ingredient[];
  isLoading: boolean;
  onAdd: () => void;
}

function IngredientsTab({ ingredients, isLoading, onAdd }: IngredientsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ingredients</CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No ingredients yet. Add ingredients to start building recipes.</p>
            <Button onClick={onAdd} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Ingredient
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ingredient.category}</Badge>
                  </TableCell>
                  <TableCell>₦{ingredient.costPerUnit.toFixed(2)}/</TableCell>
                  <TableCell>
                    {ingredient.stockQty} {ingredient.unit}
                  </TableCell>
                  <TableCell>
                    {ingredient.stockQty <= ingredient.minStock ? (
                      <Badge variant="destructive">Low</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Recipes Tab
// ============================================================================

interface RecipesTabProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAdd: () => void;
}

function RecipesTab({ recipes, isLoading, onAdd }: RecipesTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recipes</CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No recipes yet. Add your first recipe to start tracking costs.</p>
            <Button onClick={onAdd} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {recipe.portions} portions · {recipe.prepTime + recipe.cookTime} min
                      </p>
                    </div>
                    <Badge variant={recipe.isActive ? "default" : "secondary"}>
                      {recipe.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Cost:</span>
                      <span className="font-medium">₦{recipe.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Per Portion:</span>
                      <span className="font-medium">₦{recipe.costPerPortion.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ingredients:</span>
                      <span className="font-medium">{recipe.ingredients.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Pricing Tab
// ============================================================================

interface PricingTabProps {
  costAnalysis: CostAnalysis[];
  isLoading: boolean;
}

function PricingTab({ costAnalysis, isLoading }: PricingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : costAnalysis.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No pricing data available. Link recipes to menu items to see pricing recommendations.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costAnalysis.map((ca) => (
                <TableRow key={ca.recipeId}>
                  <TableCell className="font-medium">{ca.recipeName}</TableCell>
                  <TableCell>₦{ca.currentCost.toFixed(2)}</TableCell>
                  <TableCell>
                    {ca.currentPrice ? `₦${ca.currentPrice.toFixed(2)}` : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₦{ca.suggestedPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ca.currentMargin ? `${Math.round(ca.currentMargin)}%` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {ca.recommendation === "increase_price" && (
                      <Badge variant="default">Increase Price</Badge>
                    )}
                    {ca.recommendation === "reduce_cost" && (
                      <Badge variant="secondary">Reduce Cost</Badge>
                    )}
                    {ca.recommendation === "maintain" && (
                      <Badge variant="outline">Maintain</Badge>
                    )}
                    {ca.recommendation === "no_menu_item" && (
                      <Badge variant="outline">No Menu Item</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Add Ingredient Dialog
// ============================================================================

interface AddIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  onSuccess: () => void;
}

function AddIngredientDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: AddIngredientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateIngredientRequest>({
    name: "",
    unit: "kg",
    costPerUnit: 0,
    category: "other",
    stockQty: 0,
    minStock: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real implementation, this would be an API call
      // await fetch('/api/recipe-cost/ingredients', {
      //   method: 'POST',
      //   body: JSON.stringify({ storeId, ...formData })
      // });
      onSuccess();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
          <DialogDescription>
            Add a new ingredient to your inventory for use in recipes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Tomatoes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, category: value as IngredientCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="pantry">Pantry</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, unit: value as UnitType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="l">Liter (l)</SelectItem>
                  <SelectItem value="ml">Milliliter (ml)</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                  <SelectItem value="tbsp">Tablespoon</SelectItem>
                  <SelectItem value="tsp">Teaspoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit (₦)</Label>
            <Input
              id="costPerUnit"
              type="number"
              step="0.01"
              value={formData.costPerUnit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockQty">Current Stock</Label>
              <Input
                id="stockQty"
                type="number"
                step="0.01"
                value={formData.stockQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, stockQty: parseFloat(e.target.value) })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                step="0.01"
                value={formData.minStock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, minStock: parseFloat(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input
              id="supplier"
              value={formData.supplier ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="e.g., Local Market"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Ingredient"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Add Recipe Dialog
// ============================================================================

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  ingredients: Ingredient[];
  onSuccess: () => void;
}

function AddRecipeDialog({
  open,
  onOpenChange,
  storeId,
  ingredients,
  onSuccess,
}: AddRecipeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRecipeRequest>({
    name: "",
    description: "",
    portions: 1,
    prepTime: 0,
    cookTime: 0,
    instructions: [],
    ingredients: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real implementation, this would be an API call
      // await fetch('/api/recipe-cost/recipes', {
      //   method: 'POST',
      //   body: JSON.stringify({ storeId, ...formData })
      // });
      onSuccess();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: "", quantity: 0 }],
    });
  };

  const updateIngredient = (
    index: number,
    field: "ingredientId" | "quantity",
    value: string | number
  ) => {
    const updated = [...formData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ingredients: updated });
  };

  const removeIngredient = (index: number) => {
    const updated = formData.ingredients.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, ingredients: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
          <DialogDescription>Create a recipe and track its cost.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipeName">Recipe Name</Label>
            <Input
              id="recipeName"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Jollof Rice"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the dish"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portions">Portions</Label>
              <Input
                id="portions"
                type="number"
                min="1"
                value={formData.portions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, portions: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                value={formData.prepTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, prepTime: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                value={formData.cookTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, cookTime: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label>Ingredients</Label>
            {formData.ingredients.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                No ingredients added yet. Add ingredients to calculate cost.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.ingredients.map((ing: any, index: number) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={ing.ingredientId}
                        onValueChange={(value: any) =>
                          updateIngredient(index, "ingredientId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name} (₦{i.costPerUnit}/{i.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        value={ing.quantity || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateIngredient(index, "quantity", parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>

          {ingredients.length === 0 && (
            <Alert variant="default">
              <AlertDescription>
                You need to add ingredients first before creating recipes.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => onOpenChange(false)}
                >
                  Add ingredients
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || formData.ingredients.length === 0}
          >
            {isSubmitting ? "Creating..." : "Create Recipe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
