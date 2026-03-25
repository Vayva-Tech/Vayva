/**
 * Local stub so `@vayva/industry-food` typechecks without a dedicated Prisma package.
 * Replace with a real client when food-specific models are wired to the database.
 */

/** Row shape for `prisma.ingredient.findMany` (inventory-tracking). */
export interface FoodStubIngredientRow {
  id: string;
  name: string;
  unit: string;
  minStockLevel: number;
  stockLevels: Array<{ quantity: number }>;
}

/** Row shape for `prisma.order.findMany` (kitchen-display). */
export interface FoodStubOrderRow {
  id: string;
  orderNumber: string;
  items: Array<{
    quantity: number;
    notes?: string | null;
    menuItem?: { name: string } | null;
  }>;
  createdAt: Date;
  estimatedReadyTime?: Date | null;
  status: string;
}

/** Row shape for `prisma.menuItem.findMany` (menu-engineering). */
export interface FoodStubMenuItemRow {
  id: string;
  name: string;
  price: number;
  salesCount?: number | null;
  recipe?: {
    ingredients: Array<{
      quantity: number;
      ingredient: { costPerUnit: number };
    }>;
  } | null;
}

/** Row shape for `prisma.recipe.findUnique` (costing + nutritional services). */
export interface FoodStubRecipeRow {
  portions: number | null;
  ingredients: Array<{
    quantity: number;
    ingredient: {
      name: string;
      costPerUnit: number;
      caloriesPerUnit?: number | null;
      proteinPerUnit?: number | null;
      carbsPerUnit?: number | null;
      fatPerUnit?: number | null;
      fiberPerUnit?: number | null;
      sodiumPerUnit?: number | null;
    };
  }>;
}

export interface FoodPrismaStub {
  ingredient: {
    findMany: (args?: unknown) => Promise<FoodStubIngredientRow[]>;
    update: (args?: unknown) => Promise<Record<string, unknown>>;
  };
  stockLevel: {
    create: (args?: unknown) => Promise<Record<string, unknown>>;
  };
  order: {
    findMany: (args?: unknown) => Promise<FoodStubOrderRow[]>;
    update: (args?: unknown) => Promise<Record<string, unknown>>;
  };
  menuItem: {
    findMany: (args?: unknown) => Promise<FoodStubMenuItemRow[]>;
  };
  recipe: {
    findUnique: (args?: unknown) => Promise<FoodStubRecipeRow | null>;
  };
}

export const prisma: FoodPrismaStub = {
  ingredient: {
    findMany: async () => [],
    update: async () => ({}),
  },
  stockLevel: {
    create: async () => ({}),
  },
  order: {
    findMany: async () => [],
    update: async () => ({}),
  },
  menuItem: {
    findMany: async () => [],
  },
  recipe: {
    findUnique: async () => null,
  },
};
