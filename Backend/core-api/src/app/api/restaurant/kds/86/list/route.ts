import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";

class EightySixBoardController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async get86List(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const params = this.getQueryParams(req, {
          status: "active",
          limit: "50",
        });

        const eightySixItems = await prisma.eightySixItem.findMany({
          where: {
            storeId: context.storeId,
            status: params.status === "all" ? undefined : params.status,
          },
          orderBy: {
            reportedAt: "desc",
          },
          take: parseInt(params.limit),
        });

        // Get menu items affected by 86'd ingredients
        const affectedMenuItems = await this.getAffectedMenuItems(
          context.storeId,
          eightySixItems.filter(item => item.status === "active")
        );

        return {
          success: true,
          data: {
            items: eightySixItems,
            affectedMenuItems,
            summary: {
              active: eightySixItems.filter(i => i.status === "active").length,
              resolved: eightySixItems.filter(i => i.status === "resolved").length,
              lowStock: eightySixItems.filter(i => i.reason === "low_stock").length,
              outOfStock: eightySixItems.filter(i => i.reason === "out_of_stock").length,
            },
          },
        };
      },
      "GET_86_LIST",
      "86 board retrieved successfully"
    );
  }

  async add86Item(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const body = await this.parseBody(req);
        const { itemId, itemName, reason, quantityRemaining, estimatedRestock, _notes } = body;

        if (!itemId || !itemName || !reason) {
          throw new Error("Item ID, name, and reason are required");
        }

        const newItem = await prisma.eightySixItem.create({
          data: {
            storeId: context.storeId,
            itemId,
            itemName,
            reason,
            quantityRemaining: quantityRemaining || null,
            estimatedRestock: estimatedRestock ? new Date(estimatedRestock) : null,
            reportedBy: context.user.id,
            status: "active",
          },
        });

        // Auto-hide menu items that use this ingredient
        await this.autoHideMenuItems(context.storeId, itemId);

        return {
          success: true,
          data: newItem,
          message: "Item added to 86 board",
        };
      },
      "ADD_86_ITEM",
      "Item added to 86 board successfully"
    );
  }

  async update86Item(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await this.parseBody(req);

        if (!id) {
          throw new Error("86 Item ID is required");
        }

        const updatedItem = await prisma.eightySixItem.update({
          where: { id, storeId: context.storeId },
          data: {
            ...body,
            updatedAt: new Date(),
          },
        });

        // If resolved, unhide menu items
        if (body.status === "resolved") {
          await this.unhideMenuItems(context.storeId, updatedItem.itemId);
        }

        return {
          success: true,
          data: updatedItem,
          message: "86 item updated successfully",
        };
      },
      "UPDATE_86_ITEM",
      "86 item updated successfully"
    );
  }

  async remove86Item(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
          throw new Error("86 Item ID is required");
        }

        await prisma.eightySixItem.update({
          where: { id, storeId: context.storeId },
          data: {
            status: "resolved",
            resolvedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Item removed from 86 board",
        };
      },
      "REMOVE_86_ITEM",
      "Item removed from 86 board successfully"
    );
  }

  async getMenuImpact(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const active86Items = await prisma.eightySixItem.findMany({
          where: {
            storeId: context.storeId,
            status: "active",
          },
        });

        const affectedMenuItems = await this.getAffectedMenuItems(
          context.storeId,
          active86Items
        );

        return {
          success: true,
          data: {
            affectedMenuItems,
            totalAffected: affectedMenuItems.length,
            impactLevel: affectedMenuItems.length > 10 ? "high" : 
                        affectedMenuItems.length > 5 ? "medium" : "low",
          },
        };
      },
      "GET_MENU_IMPACT",
      "Menu impact analysis completed"
    );
  }

  private async getAffectedMenuItems(storeId: string, eightySixItems: any[]) {
    // Query actual menu items and their recipes from database
    const menuItems = await prisma.menuItem.findMany({
      where: { 
        storeId,
        active: true,
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // Find menu items affected by 86'd ingredients
    const affectedItems = menuItems
      .filter(item => {
        if (!item.recipe?.ingredients) return false;
        
        return item.recipe.ingredients.some(recipeIng => 
          eightySixItems.some(ing86 => 
            recipeIng.ingredient.id === ing86.itemId ||
            recipeIng.ingredient.name.toLowerCase() === ing86.itemName.toLowerCase()
          )
        );
      })
      .map(item => {
        const affectedIngredients = item.recipe!.ingredients!.filter(recipeIng =>
          eightySixItems.some(ing86 =>
            recipeIng.ingredient.id === ing86.itemId ||
            recipeIng.ingredient.name.toLowerCase() === ing86.itemName.toLowerCase()
          )
        );

        // Find possible substitutions from inventory
        const hasSubstitute = affectedIngredients.every(_ing => {
          // Check if similar ingredient exists in inventory
          return false; // Production: Query @vayva/inventory for substitutes
        });

        return {
          menuItemId: item.id,
          menuItemName: item.name,
          ingredientId: affectedIngredients[0]?.ingredient.id || '',
          ingredientName: affectedIngredients[0]?.ingredient.name || '',
          canSubstitute: hasSubstitute,
          suggestedSubstitution: null, // Production: Suggest from inventory
          impactLevel: affectedIngredients.length > 3 ? 'high' : 
                       affectedIngredients.length > 1 ? 'medium' : 'low',
        };
      });

    return affectedItems;
  }

  private async autoHideMenuItems(storeId: string, ingredientId: string) {
    // Auto-hide menu items containing this ingredient
    const menuItems = await prisma.menuItem.findMany({
      where: {
        storeId,
        active: true,
        recipe: {
          ingredients: {
            some: {
              ingredientId,
            },
          },
        },
      },
    });

    // Update menu items to hidden status
    await prisma.menuItem.updateMany({
      where: {
        id: { in: menuItems.map(item => item.id) },
      },
      data: {
        active: false,
        metadata: {
          hiddenReason: 'ingredient_86d',
          hiddenAt: new Date().toISOString(),
          hiddenIngredient: ingredientId,
        },
      },
    });

    logger.info('[KDS_86_AUTO_HIDE]', {
      storeId,
      ingredientId,
      hiddenCount: menuItems.length,
    });
  }

  private async unhideMenuItems(storeId: string, ingredientId: string) {
    // Unhide menu items that were hidden due to this ingredient
    const result = await prisma.menuItem.updateMany({
      where: {
        storeId,
        active: false,
        metadata: {
          path: ['hiddenReason'],
          equals: 'ingredient_86d',
        },
      },
      data: {
        active: true,
        metadata: {
          restoredAt: new Date().toISOString(),
          restoredIngredient: ingredientId,
        },
      },
    });

    logger.info('[KDS_86_UNHIDE]', {
      storeId,
      ingredientId,
      restoredCount: result.count,
    });
  }
}

const controller = new EightySixBoardController();

// GET /api/restaurant/kds/86/list - Get 86 board items
export const GET = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_VIEW, (req, context) =>
  controller.get86List(req, context)
);

// POST /api/restaurant/kds/86/items - Add item to 86 board
export const POST = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_EDIT, (req, context) =>
  controller.add86Item(req, context)
);

// PUT /api/restaurant/kds/86/items/:id - Update 86 item
export const UPDATE = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_EDIT, (req, context) =>
  controller.update86Item(req, context)
);

// DELETE /api/restaurant/kds/86/items/:id - Remove from 86 board
export const DELETE = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_EDIT, (req, context) =>
  controller.remove86Item(req, context)
);

// GET /api/restaurant/kds/86/menu-impact - Get menu impact analysis
export const MENU_IMPACT = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_VIEW, (req, context) =>
  controller.getMenuImpact(req, context)
);
