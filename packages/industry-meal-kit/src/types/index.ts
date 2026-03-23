// @ts-nocheck
// ============================================================================
// Meal Kit TypeScript Types
// ============================================================================

import { z } from 'zod';

// Subscription Types
export interface MealKitSubscription {
  id: string;
  storeId: string;
  customerId: string;
  planType: MealKitPlanType;
  portionsPerMeal: number;
  mealsPerWeek: number;
  status: string;
  preferences: any;
  skipWeeks: string[];
  nextDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MealKitPlanType = 'BASIC' | 'PREMIUM' | 'FAMILY' | 'VEGAN' | 'KETO' | 'LOW_CARB';

// Recipe Types
export interface MealKitRecipe {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  calories?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
  weeklyMenuIds: string[];
  createdAt: Date;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
}

// Weekly Menu Types
export interface WeeklyMenu {
  id: string;
  storeId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  recipes: WeeklyMenuRecipe[];
  isActive: boolean;
  createdAt: Date;
}

export interface WeeklyMenuRecipe {
  recipeId: string;
  name: string;
  category: string;
  difficulty: string;
}

// Customer Preference Types
export interface CustomerMealPreference {
  id: string;
  storeId: string;
  customerId: string;
  subscriptionId?: string;
  dislikes: string[];
  allergies: string[];
  dietaryType?: string;
  spiceLevel: 'mild' | 'medium' | 'hot';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery Slot Types
export interface DeliverySlot {
  id: string;
  storeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  isAvailable: boolean;
  zipCodes: string[];
  createdAt: Date;
}

// Zod Schemas for Validation
export const MealKitSubscriptionSchema = z.object({
  storeId: z.string(),
  customerId: z.string(),
  planType: z.enum(['BASIC', 'PREMIUM', 'FAMILY', 'VEGAN', 'KETO', 'LOW_CARB']),
  portionsPerMeal: z.number().min(2).max(8),
  mealsPerWeek: z.number().min(2).max(5),
  nextDelivery: z.date(),
  preferences: z.record(z.any()).optional(),
});

export const WeeklyMenuSchema = z.object({
  storeId: z.string(),
  weekStartDate: z.date(),
  weekEndDate: z.date(),
  recipes: z.array(
    z.object({
      recipeId: z.string(),
      name: z.string(),
      category: z.string(),
      difficulty: z.string(),
    })
  ),
});

export const MealKitRecipeSchema = z.object({
  storeId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prepTime: z.number().min(5).max(180),
  cookTime: z.number().min(5).max(300),
  servings: z.number().min(1).max(20),
  calories: z.number().optional(),
  ingredients: z.array(
    z.object({
      ingredientId: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
    })
  ),
  instructions: z.array(z.string()).min(1),
  imageUrl: z.string().url(),
  tags: z.array(z.string()),
  isAvailable: z.boolean().default(true),
});

export const CustomerMealPreferenceSchema = z.object({
  storeId: z.string(),
  customerId: z.string(),
  dislikes: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dietaryType: z.string().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot']).default('medium'),
  notes: z.string().optional(),
});

export const DeliverySlotSchema = z.object({
  storeId: z.string(),
  date: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxCapacity: z.number().positive(),
  zipCodes: z.array(z.string()),
});

// Type inference from schemas
export type MealKitSubscriptionInput = z.infer<typeof MealKitSubscriptionSchema>;
export type WeeklyMenuInput = z.infer<typeof WeeklyMenuSchema>;
export type MealKitRecipeInput = z.infer<typeof MealKitRecipeSchema>;
export type CustomerMealPreferenceInput = z.infer<typeof CustomerMealPreferenceSchema>;
export type DeliverySlotInput = z.infer<typeof DeliverySlotSchema>;
