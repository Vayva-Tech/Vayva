"use client";

import React, { useState, useEffect } from "react";
import { Badge, Card, CardContent, CardHeader, Button } from "@vayva/ui";
interface Recipe {
  recipeId: string;
  name: string;
  category: string;
  difficulty: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  calories?: number;
  imageUrl?: string;
}

interface WeeklyRecipeSelectorProps {
  storeId: string;
  weekStartDate: Date;
  selectedRecipes?: string[];
  onRecipeSelect?: (recipeIds: string[]) => void;
  maxRecipes?: number;
}

export function WeeklyRecipeSelector({
  storeId,
  weekStartDate,
  selectedRecipes = [],
  onRecipeSelect,
  maxRecipes = 5,
}: WeeklyRecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    void fetchRecipes();
  }, [storeId, weekStartDate]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/meal-kit/recipes?storeId=${storeId}&weekStart=${weekStartDate.toISOString()}`
      );
      if (response.ok) {
        const data = (await response.json()) as Recipe[];
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecipe = (recipeId: string) => {
    const newSelected = selectedRecipes.includes(recipeId)
      ? selectedRecipes.filter((id) => id !== recipeId)
      : [...selectedRecipes, recipeId];

    if (newSelected.length <= maxRecipes) {
      onRecipeSelect?.(newSelected);
    }
  };

  const categories = [
    "all",
    "vegetarian",
    "vegan",
    "keto",
    "low-carb",
    "high-protein",
  ];

  const filteredRecipes =
    selectedCategory === "all"
      ? recipes
      : recipes.filter((r) => r.category === selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Weekly recipes</h3>
        <p className="text-sm text-gray-600">
          Choose up to {maxRecipes} meals for this week
        </p>
        <div className="mt-2">
          <label htmlFor="recipe-category" className="sr-only">
            Category
          </label>
          <select
            id="recipe-category"
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading recipes…</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredRecipes.map((recipe) => {
              const selected = selectedRecipes.includes(recipe.recipeId);
              return (
                <div
                  key={recipe.recipeId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="outline">{recipe.category}</Badge>
                      <Badge variant="info">{recipe.difficulty}</Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${
                      selected
                        ? "bg-gray-200 text-gray-900"
                        : "bg-slate-900 text-white"
                    }`}
                    onClick={() => handleToggleRecipe(recipe.recipeId)}
                  >
                    {selected ? "Remove" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
