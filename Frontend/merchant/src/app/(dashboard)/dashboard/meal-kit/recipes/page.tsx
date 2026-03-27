/**
 * Meal Kit Industry - Recipe Management Page
 * Manage meal kit recipes, ingredients, and nutritional information
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChefHat, Search, Plus, Clock, Users } from "lucide-react";
import { useState } from "react";

interface Recipe {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  cuisine: "italian" | "mexican" | "asian" | "american" | "mediterranean" | "indian";
  difficulty: "easy" | "medium" | "hard";
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: number;
  status: "active" | "seasonal" | "retired";
  rating: number;
  popularity: number;
}

export default function MealKitRecipesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const recipes: Recipe[] = [
    { id: "1", name: "Grilled Salmon with Quinoa", category: "dinner", cuisine: "mediterranean", difficulty: "medium", prepTime: 15, cookTime: 25, servings: 2, calories: 520, protein: 42, carbs: 38, fat: 22, ingredients: 12, status: "active", rating: 4.8, popularity: 95 },
    { id: "2", name: "Chicken Tikka Masala", category: "dinner", cuisine: "indian", difficulty: "medium", prepTime: 20, cookTime: 30, servings: 4, calories: 480, protein: 38, carbs: 42, fat: 18, ingredients: 15, status: "active", rating: 4.7, popularity: 92 },
    { id: "3", name: "Veggie Breakfast Burrito", category: "breakfast", cuisine: "mexican", difficulty: "easy", prepTime: 10, cookTime: 15, servings: 2, calories: 380, protein: 18, carbs: 45, fat: 14, ingredients: 10, status: "active", rating: 4.5, popularity: 88 },
    { id: "4", name: "Pad Thai Shrimp", category: "dinner", cuisine: "asian", difficulty: "hard", prepTime: 25, cookTime: 20, servings: 3, calories: 450, protein: 32, carbs: 52, fat: 16, ingredients: 14, status: "active", rating: 4.9, popularity: 97 },
    { id: "5", name: "Caprese Salad Bowl", category: "lunch", cuisine: "italian", difficulty: "easy", prepTime: 15, cookTime: 0, servings: 2, calories: 320, protein: 16, carbs: 22, fat: 20, ingredients: 8, status: "seasonal", rating: 4.6, popularity: 85 },
    { id: "6", name: "Beef Tacos al Pastor", category: "dinner", cuisine: "mexican", difficulty: "medium", prepTime: 20, cookTime: 25, servings: 4, calories: 510, protein: 35, carbs: 48, fat: 24, ingredients: 13, status: "active", rating: 4.8, popularity: 94 },
    { id: "7", name: "Greek Yogurt Parfait", category: "breakfast", cuisine: "mediterranean", difficulty: "easy", prepTime: 10, cookTime: 0, servings: 1, calories: 280, protein: 22, carbs: 35, fat: 8, ingredients: 6, status: "active", rating: 4.4, popularity: 82 },
    { id: "8", name: "Teriyaki Chicken Bowl", category: "lunch", cuisine: "asian", difficulty: "easy", prepTime: 15, cookTime: 20, servings: 2, calories: 490, protein: 36, carbs: 58, fat: 12, ingredients: 11, status: "active", rating: 4.7, popularity: 91 },
  ];

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: recipes.length,
    active: recipes.filter(r => r.status === "active").length,
    seasonal: recipes.filter(r => r.status === "seasonal").length,
    avgPrepTime: Math.round(recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length),
    avgRating: (recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length).toFixed(1),
    avgPopularity: Math.round(recipes.reduce((sum, r) => sum + r.popularity, 0) / recipes.length),
  };

  const categoryBreakdown = [
    { category: "Breakfast", count: recipes.filter(r => r.category === "breakfast").length, color: "from-yellow-500 to-orange-500" },
    { category: "Lunch", count: recipes.filter(r => r.category === "lunch").length, color: "from-green-500 to-emerald-500" },
    { category: "Dinner", count: recipes.filter(r => r.category === "dinner").length, color: "from-red-500 to-pink-500" },
    { category: "Snack", count: recipes.filter(r => r.category === "snack").length, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/meal-kit")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Recipe Library
              </h1>
              <p className="text-muted-foreground mt-1">Manage meal kit recipes and nutritional data</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recipes</CardTitle>
              <ChefHat className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active, {stats.seasonal} seasonal</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Prep Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgPrepTime} min</div>
              <p className="text-xs text-muted-foreground mt-1">Average preparation</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <Badge className="h-6 w-6 text-xs">★</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Popularity</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgPopularity}%</div>
              <p className="text-xs text-muted-foreground mt-1">Customer favorite rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Recipe Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.count} recipes</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${cat.color}`}
                      style={{ width: `${(cat.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipe name, cuisine, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipes Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recipes ({filteredRecipes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Recipe Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Cuisine</th>
                    <th className="text-left py-3 px-4 font-semibold">Difficulty</th>
                    <th className="text-left py-3 px-4 font-semibold">Time (Prep + Cook)</th>
                    <th className="text-left py-3 px-4 font-semibold">Servings</th>
                    <th className="text-left py-3 px-4 font-semibold">Calories</th>
                    <th className="text-left py-3 px-4 font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold">{recipe.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {recipe.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">{recipe.cuisine}</td>
                      <td className="py-3 px-4">
                        <Badge variant={recipe.difficulty === "easy" ? "default" : recipe.difficulty === "medium" ? "secondary" : "destructive"} className="capitalize">
                          {recipe.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {recipe.prepTime}m prep + {recipe.cookTime}m cook
                      </td>
                      <td className="py-3 px-4 text-sm">{recipe.servings} servings</td>
                      <td className="py-3 px-4 font-mono font-semibold text-orange-600">{recipe.calories}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-yellow-600">{recipe.rating}</span>
                          <span className="text-yellow-600">★</span>
                          <span className="text-xs text-muted-foreground">({recipe.popularity}%)</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={recipe.status === "active" ? "default" : recipe.status === "seasonal" ? "secondary" : "outline"}>
                          {recipe.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/meal-kit/recipes/${recipe.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-blue-600">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
