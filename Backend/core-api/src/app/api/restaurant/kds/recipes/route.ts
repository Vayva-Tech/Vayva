import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class RecipeController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async getRecipes(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const recipes = await prisma.recipe.findMany({
          where: { storeId: context.storeId },
          include: {
            ingredients: true,
          },
          orderBy: { name: "asc" },
        });

        return {
          success: true,
          data: recipes,
          summary: {
            total: recipes.length,
            avgCost: recipes.reduce((acc, r) => acc + r.totalCost, 0) / recipes.length || 0,
            avgMargin: recipes.reduce((acc, r) => {
              const margin = ((r.suggestedPrice - r.totalCost) / r.suggestedPrice) * 100;
              return acc + margin;
            }, 0) / recipes.length || 0,
          },
        };
      },
      "GET_RECIPES",
      "Recipes retrieved successfully"
    );
  }

  async getRecipeCosting(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const recipeId = searchParams.get("id");

        if (!recipeId) {
          throw new Error("Recipe ID is required");
        }

        const recipe = await prisma.recipe.findUnique({
          where: { id: recipeId, storeId: context.storeId },
          include: {
            ingredients: true,
          },
        });

        if (!recipe) {
          throw new Error("Recipe not found");
        }

        // Calculate detailed costing breakdown
        const costBreakdown = {
          totalCost: recipe.totalCost,
          costPerPortion: recipe.costPerPortion,
          yield: recipe.yield,
          yieldUnit: recipe.yieldUnit,
          ingredients: recipe.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.cost,
            percentage: (ing.cost / recipe.totalCost) * 100,
          })),
          targetFoodCostPct: recipe.targetFoodCostPct,
          suggestedPrice: recipe.suggestedPrice,
          actualMargin: ((recipe.suggestedPrice - recipe.totalCost) / recipe.suggestedPrice) * 100,
        };

        return {
          success: true,
          data: costBreakdown,
        };
      },
      "GET_RECIPE_COSTING",
      "Recipe costing retrieved successfully"
    );
  }

  async getProfitabilityMatrix(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const recipes = await prisma.recipe.findMany({
          where: { storeId: context.storeId },
          include: {
            ingredients: true,
          },
        });

        // Calculate profitability metrics for each recipe with actual sales data
        const matrix = await Promise.all(
          recipes.map(async (recipe) => {
            const margin = ((recipe.suggestedPrice - recipe.totalCost) / recipe.suggestedPrice) * 100;
            
            // Get actual sales data from orders in the last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const orderItems = await prisma.orderItem.findMany({
              where: {
                storeId: context.storeId,
                recipeId: recipe.id,
                createdAt: { gte: thirtyDaysAgo },
              },
              include: {
                order: {
                  select: {
                    status: true,
                    createdAt: true,
                  },
                },
              },
            });

            // Calculate popularity score based on order frequency and recency
            let popularityScore = 0;
            if (orderItems.length > 0) {
              const totalQuantity = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
              const recentOrders = orderItems.filter(
                (item) => item.order.status === 'COMPLETED' && 
                         new Date(item.order.createdAt) > thirtyDaysAgo
              ).length;
              
              // Popularity based on frequency (0-50 points) and recency (0-50 points)
              const frequencyScore = Math.min(50, totalQuantity * 2);
              const recencyScore = Math.min(50, recentOrders * 3);
              popularityScore = frequencyScore + recencyScore;
            }

            return {
              recipeId: recipe.id,
              name: recipe.name,
              cost: recipe.totalCost,
              price: recipe.suggestedPrice,
              margin: margin.toFixed(2),
              popularity: popularityScore.toFixed(2),
              category: this.categorizeMenuItem(margin, popularityScore),
              salesCount: orderItems.length,
            };
          })
        );

        // Group by BCG matrix categories
        const categorized = {
          stars: matrix.filter(m => m.category === "star"),
          plowhorses: matrix.filter(m => m.category === "plowhorse"),
          puzzles: matrix.filter(m => m.category === "puzzle"),
          dogs: matrix.filter(m => m.category === "dog"),
        };

        return {
          success: true,
          data: {
            all: matrix,
            categorized,
            summary: {
              stars: categorized.stars.length,
              plowhorses: categorized.plowhorses.length,
              puzzles: categorized.puzzles.length,
              dogs: categorized.dogs.length,
            },
          },
        };
      },
      "GET_PROFITABILITY_MATRIX",
      "Profitability matrix generated successfully"
    );
  }

  private categorizeMenuItem(margin: number, popularity: number): "star" | "plowhorse" | "puzzle" | "dog" {
    const highMargin = margin > 65;
    const highPopularity = popularity > 70;

    if (highMargin && highPopularity) return "star";
    if (!highMargin && highPopularity) return "plowhorse";
    if (highMargin && !highPopularity) return "puzzle";
    return "dog";
  }
}

const controller = new RecipeController();

// GET /api/restaurant/kds/recipes - List all recipes
export const GET = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_VIEW, (req, context) =>
  controller.getRecipes(req, context)
);

// GET /api/restaurant/kds/recipes/:id/costing - Get recipe costing breakdown
export const COSTING = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_VIEW, (req, context) =>
  controller.getRecipeCosting(req, context)
);

// GET /api/restaurant/kds/recipes/profitability - Get menu engineering matrix
export const PROFITABILITY = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getProfitabilityMatrix(req, context)
);
