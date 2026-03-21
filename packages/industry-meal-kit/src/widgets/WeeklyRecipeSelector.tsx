'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vayva/ui/components/ui/tabs';
import { ChefHat, Clock, Users, Flame, Plus, Check, X } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Fetch recipes for the week
    fetchRecipes();
  }, [storeId, weekStartDate]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meal-kit/recipes?storeId=${storeId}&weekStart=${weekStartDate.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecipe = (recipeId: string) => {
    const newSelected = selectedRecipes.includes(recipeId)
      ? selectedRecipes.filter(id => id !== recipeId)
      : [...selectedRecipes, recipeId];

    if (newSelected.length <= maxRecipes && onRecipeSelect) {
      onRecipeSelect(newSelected);
    }
  };

  const categories = ['all', 'vegetarian', 'vegan', 'keto', 'low-carb', 'high-protein'];
  
  const filteredRecipes = selectedCategory === 'all'
    ? recipes
    : recipes.filter(r => r.category === selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Weekly Recipe Selection
            </CardTitle>
            <CardDescription>
              Choose up to {maxRecipes} recipes for the week of {weekStartDate.toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={selectedRecipes.length >= maxRecipes ? 'destructive' : 'default'}>
            {selectedRecipes.length}/{maxRecipes} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading recipes...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recipes available</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map(recipe => (
                  <Card 
                    key={recipe.recipeId}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRecipes.includes(recipe.recipeId) ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => handleToggleRecipe(recipe.recipeId)}
                  >
                    <div className="relative">
                      {recipe.imageUrl && (
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        {selectedRecipes.includes(recipe.recipeId) ? (
                          <Button size="icon" variant="secondary" className="h-8 w-8 bg-emerald-500 text-white">
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="outline" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-2">{recipe.name}</h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{recipe.category}</Badge>
                        <Badge variant="secondary">{recipe.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {recipe.prepTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime}m
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </span>
                        )}
                        {recipe.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {recipe.calories} cal
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
