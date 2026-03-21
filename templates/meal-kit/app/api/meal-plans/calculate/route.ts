// ============================================================================
// Meal Plan Pricing Calculator API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

interface PricingConfig {
  basePrices: Record<string, number>;
  perMealPrices: Record<string, number>;
  portionMultipliers: Record<number, number>;
  discounts: {
    bulkDiscountThreshold: number;
    bulkDiscountPercent: number;
  };
}

const DEFAULT_PRICING: PricingConfig = {
  basePrices: {
    BASIC: 5000,
    PREMIUM: 8000,
    FAMILY: 12000,
    VEGAN: 7000,
    KETO: 9000,
    LOW_CARB: 8500,
  },
  perMealPrices: {
    BASIC: 2500,
    PREMIUM: 3500,
    FAMILY: 4500,
    VEGAN: 3000,
    KETO: 4000,
    LOW_CARB: 3800,
  },
  portionMultipliers: {
    2: 0.6,
    4: 1.0,
    6: 1.4,
    8: 1.8,
  },
  discounts: {
    bulkDiscountThreshold: 5,
    bulkDiscountPercent: 0.1,
  },
};

// POST /api/meal-plans/calculate - Calculate meal plan pricing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planType,
      portionsPerMeal,
      mealsPerWeek,
      weeks = 1,
    } = body;

    // Validate required fields
    if (!planType || !portionsPerMeal || !mealsPerWeek) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const config = DEFAULT_PRICING;
    
    const basePrice = config.basePrices[planType] || config.basePrices.BASIC;
    const perMealPrice = config.perMealPrices[planType] || config.perMealPrices.BASIC;
    const portionMultiplier = config.portionMultipliers[portionsPerMeal] || 1.0;

    const weeklyPrice = (basePrice + (perMealPrice * mealsPerWeek)) * portionMultiplier;
    let totalPrice = weeklyPrice * weeks;
    let discount = 0;

    // Apply bulk discount if applicable
    if (weeks >= config.discounts.bulkDiscountThreshold) {
      discount = totalPrice * config.discounts.bulkDiscountPercent;
      totalPrice -= discount;
    }

    const breakdown = {
      basePrice,
      mealPrice: perMealPrice * mealsPerWeek,
      portionMultiplier,
      weeklyTotal: Math.round(weeklyPrice),
      subtotal: Math.round(weeklyPrice * weeks),
      discount: Math.round(discount),
      total: Math.round(totalPrice),
      savings: Math.round(discount),
    };

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error('Failed to calculate pricing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}

// GET /api/meal-plans/calculate - Compare plans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const portionsPerMeal = parseInt(searchParams.get('portions') || '4');
    const mealsPerWeek = parseInt(searchParams.get('meals') || '3');
    const weeks = parseInt(searchParams.get('weeks') || '1');

    const config = DEFAULT_PRICING;
    const comparison: Record<string, number> = {};

    Object.keys(config.basePrices).forEach(planType => {
      const basePrice = config.basePrices[planType];
      const perMealPrice = config.perMealPrices[planType];
      const portionMultiplier = config.portionMultipliers[portionsPerMeal] || 1.0;

      const weeklyPrice = (basePrice + (perMealPrice * mealsPerWeek)) * portionMultiplier;
      let totalPrice = weeklyPrice * weeks;

      if (weeks >= config.discounts.bulkDiscountThreshold) {
        totalPrice *= (1 - config.discounts.bulkDiscountPercent);
      }

      comparison[planType] = Math.round(totalPrice);
    });

    return NextResponse.json({
      comparison,
      parameters: {
        portionsPerMeal,
        mealsPerWeek,
        weeks,
      },
    });
  } catch (error) {
    console.error('Failed to compare plans:', error);
    return NextResponse.json(
      { error: 'Failed to compare plans' },
      { status: 500 }
    );
  }
}
