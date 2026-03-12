import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { IndustryValidator, MenuItemSchema } from "@/lib/industry/validation";
import { APIContext } from "@/lib/api-handler";

class RestaurantMenuController extends BaseIndustryController {
  constructor() {
    super("restaurant", "menu");
  }

  async getCategories(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        // Simulate menu categories
        return {
          categories: [
            {
              id: "cat_1",
              name: "Appetizers",
              description: "Start your meal with our delicious starters",
              itemCount: 8,
              isActive: true,
              sortOrder: 1,
            },
            {
              id: "cat_2",
              name: "Main Courses",
              description: "Hearty meals to satisfy your appetite",
              itemCount: 15,
              isActive: true,
              sortOrder: 2,
            },
            {
              id: "cat_3",
              name: "Desserts",
              description: "Sweet endings to your dining experience",
              itemCount: 6,
              isActive: true,
              sortOrder: 3,
            },
          ],
        };
      },
      "GET_CATEGORIES"
    );
  }

  async createCategory(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const body = await this.parseBody(req);
        
        if (!body.name) {
          throw new Error("Category name is required");
        }

        // Simulate creation
        const newCategory = {
          id: `cat_${Date.now()}`,
          ...body,
          itemCount: 0,
          isActive: true,
          sortOrder: body.sortOrder || 999,
          createdAt: new Date().toISOString(),
        };

        return newCategory;
      },
      "CREATE_CATEGORY",
      "Menu category created successfully"
    );
  }

  async updateCategory(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        
        if (!id) {
          throw new Error("Category ID is required");
        }

        const body = await this.parseBody(req);
        
        // Simulate update
        const updatedCategory = {
          id,
          ...body,
          updatedAt: new Date().toISOString(),
        };

        return updatedCategory;
      },
      "UPDATE_CATEGORY",
      "Menu category updated successfully"
    );
  }

  async getMenuItems(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const params = this.getQueryParams(req, {
          categoryId: null,
          isActive: true,
          page: 1,
          limit: 50,
        });

        // Simulate menu items
        const mockMenuItems = [
          {
            id: "item_1",
            name: "Caesar Salad",
            description: "Fresh romaine lettuce with parmesan and croutons",
            price: 12.99,
            category: "cat_1",
            categoryName: "Appetizers",
            prepTime: 8,
            isVegetarian: true,
            isVegan: false,
            allergens: ["dairy"],
            ingredients: ["romaine lettuce", "parmesan", "croutons", "caesar dressing"],
            isActive: true,
            popularity: 85,
            timesOrdered: 127,
          },
          {
            id: "item_2",
            name: "Grilled Salmon",
            description: "Atlantic salmon with lemon herb butter",
            price: 24.99,
            category: "cat_2",
            categoryName: "Main Courses",
            prepTime: 15,
            isVegetarian: false,
            isVegan: false,
            allergens: ["fish"],
            ingredients: ["salmon", "lemon", "herbs", "butter"],
            isActive: true,
            popularity: 92,
            timesOrdered: 89,
          },
        ];

        const filteredItems = mockMenuItems.filter(item => {
          if (params.categoryId && item.category !== params.categoryId) return false;
          if (params.isActive !== undefined && item.isActive !== params.isActive) return false;
          return true;
        });

        const paginated = this.paginate(filteredItems, params.page, params.limit);
        return paginated;
      },
      "GET_MENU_ITEMS"
    );
  }

  async createMenuItem(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const body = await this.parseBody(req);
        const validatedData = IndustryValidator.validate(MenuItemSchema, body);

        // Simulate creation
        const newMenuItem = {
          id: `item_${Date.now()}`,
          ...validatedData,
          popularity: 0,
          timesOrdered: 0,
          createdAt: new Date().toISOString(),
        };

        return newMenuItem;
      },
      "CREATE_MENU_ITEM",
      "Menu item created successfully"
    );
  }

  async updateMenuItemAvailability(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await this.parseBody(req);
        const { isActive } = body;

        if (!id) {
          throw new Error("Menu item ID is required");
        }

        if (isActive === undefined) {
          throw new Error("isActive status is required");
        }

        // Simulate availability update
        return {
          id,
          isActive,
          updatedAt: new Date().toISOString(),
        };
      },
      "UPDATE_ITEM_AVAILABILITY",
      "Menu item availability updated successfully"
    );
  }
}

const controller = new RestaurantMenuController();

// GET /api/restaurant/menu/categories - Get menu categories
export const CATEGORIES = createIndustryAPI("restaurant", PERMISSIONS.PRODUCTS_VIEW, (req, context) =>
  controller.getCategories(req, context)
);

// POST /api/restaurant/menu/categories - Create menu category
export const CREATE_CATEGORY = createIndustryAPI("restaurant", PERMISSIONS.PRODUCTS_EDIT, (req, context) =>
  controller.createCategory(req, context)
);

// PUT /api/restaurant/menu/categories/:id - Update menu category
export const UPDATE_CATEGORY = createIndustryAPI("restaurant", PERMISSIONS.PRODUCTS_EDIT, (req, context) =>
  controller.updateCategory(req, context)
);

// POST /api/restaurant/menu/items - Create menu item
export const CREATE_ITEM = createIndustryAPI("restaurant", PERMISSIONS.PRODUCTS_EDIT, (req, context) =>
  controller.createMenuItem(req, context)
);

// PUT /api/restaurant/menu/items/:id/availability - Update item availability
export const ITEM_AVAILABILITY = createIndustryAPI("restaurant", PERMISSIONS.PRODUCTS_EDIT, (req, context) =>
  controller.updateMenuItemAvailability(req, context)
);