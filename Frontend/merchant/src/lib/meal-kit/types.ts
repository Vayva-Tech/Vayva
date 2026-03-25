// ============================================================================
// Meal Kit API Type Definitions
// Centralized TypeScript types for all meal kit API operations
// ============================================================================

import { z } from 'zod';
import type {
  MealKitSubscription,
  WeeklyMenu,
  MealKitRecipe,
  CustomerMealPreference,
  DeliverySlot,
} from '../../../../../infra/db/src/generated/client';

// ============================================================================
// Plan Types
// ============================================================================

export const MealKitPlanTypeEnum = z.enum(['BASIC', 'PREMIUM', 'FAMILY', 'VEGAN', 'KETO', 'LOW_CARB']);
export type MealKitPlanType = z.infer<typeof MealKitPlanTypeEnum>;

export interface PlanPricing {
  basePrice: number;
  perMealPrice: number;
  features: string[];
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface MealKitSubscriptionWithDetails extends MealKitSubscription {
  customerName?: string;
  customerEmail?: string;
  planPricing?: PlanPricing;
}

export const CreateSubscriptionSchema = z.object({
  storeId: z.string().min(1, 'storeId is required'),
  customerId: z.string().min(1, 'customerId is required'),
  planType: MealKitPlanTypeEnum,
  portionsPerMeal: z.number().min(2).max(8).default(4),
  mealsPerWeek: z.number().min(2).max(5).default(3),
  nextDelivery: z.string().transform((str) => new Date(str)),
  preferences: z.record(z.unknown()).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

export interface SubscriptionQueryParams {
  storeId: string;
  customerId?: string | null;
  status?: string | null;
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface MealKitRecipeWithIngredients extends MealKitRecipe {
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
    productName?: string;
  }>;
}

export const CreateRecipeSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  prepTime: z.number().min(5).max(180).default(15),
  cookTime: z.number().min(5).max(300).default(30),
  servings: z.number().min(1).max(20).default(4),
  calories: z.number().optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).default([]),
  instructions: z.array(z.string()).min(1),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;

export interface RecipeQueryParams {
  storeId: string;
  category?: string | null;
  difficulty?: string | null;
  weekStart?: string | null;
}

// ============================================================================
// Weekly Menu Types
// ============================================================================

export interface WeeklyMenuWithRecipes extends WeeklyMenu {
  recipes: Array<{
    recipeId: string;
    name: string;
    category: string;
    difficulty: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    calories?: number;
    imageUrl?: string;
  }>;
}

export const WeeklyMenuSchema = z.object({
  storeId: z.string().min(1),
  weekStartDate: z.string().transform((str) => new Date(str)),
  weekEndDate: z.string().transform((str) => new Date(str)),
  recipes: z.array(z.object({
    recipeId: z.string(),
    name: z.string(),
    category: z.string(),
    difficulty: z.string(),
  })),
});

export type WeeklyMenuInput = z.infer<typeof WeeklyMenuSchema>;

// ============================================================================
// Delivery Slot Types
// ============================================================================

export interface DeliverySlotWithAvailability extends DeliverySlot {
  remainingCapacity: number;
  isBookable: boolean;
}

export const DeliverySlotSchema = z.object({
  storeId: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxCapacity: z.number().positive(),
  zipCodes: z.array(z.string()),
});

export type DeliverySlotInput = z.infer<typeof DeliverySlotSchema>;

export interface DeliverySlotQueryParams {
  storeId: string;
  date?: string | null;
  zipCode?: string | null;
}

// ============================================================================
// Customer Preference Types
// ============================================================================

export interface CustomerMealPreferenceComplete extends CustomerMealPreference {
  subscriptionPlanType?: MealKitPlanType;
  nextDeliveryDate?: Date;
}

export const MealPreferenceSchema = z.object({
  storeId: z.string().min(1),
  customerId: z.string().min(1),
  dislikes: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dietaryType: z.string().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot']).default('medium'),
  notes: z.string().optional(),
});

export type MealPreferenceInput = z.infer<typeof MealPreferenceSchema>;

// ============================================================================
// Inventory Types
// ============================================================================

export interface IngredientRequirement {
  productId: string;
  productName: string;
  requiredQuantity: number;
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
  stockStatus: 'critical' | 'low' | 'good';
  stockPercentage: number;
}

// ============================================================================
// Pricing Types
// ============================================================================

export interface PricingBreakdown {
  basePrice: number;
  mealPrice: number;
  portionMultiplier: number;
  weeklyTotal: number;
  total: number;
  discount?: number;
  savings?: number;
}

export interface PlanComparison {
  [planType: string]: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
