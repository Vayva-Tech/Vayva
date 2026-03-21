"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Badge } from "@vayva/ui";
import { Clock, ChefHat, Star, Leaf, Flame } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  image: string;
  cookTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  rating: number;
  reviews: number;
  tags: string[];
  price: number;
}

const WEEKLY_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Garlic Butter Steak Bites",
    image: "/meal-kit/recipes/steak-bites.jpg",
    cookTime: 20,
    difficulty: "Easy",
    calories: 450,
    rating: 4.8,
    reviews: 342,
    tags: ["High Protein", "Keto-Friendly"],
    price: 12.99,
  },
  {
    id: "2",
    name: "Creamy Tuscan Chicken",
    image: "/meal-kit/recipes/tuscan-chicken.jpg",
    cookTime: 30,
    difficulty: "Medium",
    calories: 520,
    rating: 4.9,
    reviews: 521,
    tags: ["Customer Favorite", "Gluten-Free"],
    price: 11.99,
  },
  {
    id: "3",
    name: "Vegetarian Buddha Bowl",
    image: "/meal-kit/recipes/buddha-bowl.jpg",
    cookTime: 25,
    difficulty: "Easy",
    calories: 380,
    rating: 4.7,
    reviews: 289,
    tags: ["Vegetarian", "Vegan", "High Fiber"],
    price: 10.99,
  },
  {
    id: "4",
    name: "Honey Glazed Salmon",
    image: "/meal-kit/recipes/salmon.jpg",
    cookTime: 25,
    difficulty: "Medium",
    calories: 490,
    rating: 4.9,
    reviews: 612,
    tags: ["Omega-3", "Heart Healthy"],
    price: 14.99,
  },
  {
    id: "5",
    name: "Spicy Shrimp Tacos",
    image: "/meal-kit/recipes/shrimp-tacos.jpg",
    cookTime: 20,
    difficulty: "Easy",
    calories: 420,
    rating: 4.8,
    reviews: 445,
    tags: ["Seafood", "Quick & Easy"],
    price: 13.99,
  },
  {
    id: "6",
    name: "Mushroom Risotto",
    image: "/meal-kit/recipes/risotto.jpg",
    cookTime: 40,
    difficulty: "Hard",
    calories: 510,
    rating: 4.6,
    reviews: 198,
    tags: ["Vegetarian", "Italian"],
    price: 11.49,
  },
];

export default function WeeklyMenuPage() {
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  const toggleRecipe = (id: string) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
            This Week's Menu
          </Badge>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Fresh Recipes for March 18-24
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose {selectedRecipes.length}/3 meals for your weekly box. Mix and match to customize your plan.
          </p>
        </motion.div>

        {/* Selected Count */}
        {selectedRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-4 z-50 bg-emerald-600 text-white rounded-2xl p-6 mb-12 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {selectedRecipes.length} of 3 meals selected
                </p>
                <p className="text-emerald-100">
                  {3 - selectedRecipes.length} more to complete your box
                </p>
              </div>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-8 h-12 rounded-xl">
                Continue to Checkout
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WEEKLY_RECIPES.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleRecipe(recipe.id)}
              className={`cursor-pointer rounded-3xl border-2 transition-all overflow-hidden ${
                selectedRecipes.includes(recipe.id)
                  ? "border-emerald-600 bg-emerald-50 shadow-2xl scale-105"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              {/* Image */}
              <div className="aspect-video bg-gray-200 relative">
                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                {selectedRecipes.includes(recipe.id) && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">✓</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{recipe.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{recipe.rating}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{recipe.cookTime} min</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                      <Flame className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{recipe.calories}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{recipe.difficulty}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-2xl font-black text-emerald-600">${recipe.price}</p>
                    <p className="text-xs text-gray-600">per serving</p>
                  </div>
                  <Button 
                    className={`font-bold px-6 h-11 rounded-xl ${
                      selectedRecipes.includes(recipe.id)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {selectedRecipes.includes(recipe.id) ? "Selected ✓" : "Add"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {WEEKLY_RECIPES.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No recipes this week</h3>
            <p className="text-gray-600">Check back next Monday for new meals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
