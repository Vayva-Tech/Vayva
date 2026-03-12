import { Prisma } from "./generated/client";

/**
 * Isolated Prisma Extension
 * Automates tenant isolation by injecting storeId/merchantId filters.
 */
export const isolatedExtension = (storeId: string) => {
  return Prisma.defineExtension({
    name: "isolatedPrisma",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // List of models that require tenant isolation
          const tenantScopedModels = [
            "Order",
            "Product",
            "Customer",
            "Booking",
            "InventoryItem",
            "Collection",
            "DiscountRule",
            "Refund",
            "Payout",
            "SupportTicket",
            "LedgerTransaction",
            "Cart",
          ];

          if (tenantScopedModels.includes(model)) {
            // Map models to their tenant field (merchantId or storeId)
            const merchantIdModels = [
              "InventoryItem",
              "ReturnRequest",
              "Payout",
            ];
            const tenantField = merchantIdModels.includes(model)
              ? "merchantId"
              : "storeId";

            // Inject tenant filter into read and update operations
            const typedArgs = args as {
              where?: Record<string, unknown>;
              data?: Record<string, unknown> | Array<Record<string, unknown>>;
            };

            if (
              [
                "findFirst",
                "findUnique",
                "findMany",
                "update",
                "updateMany",
                "delete",
                "deleteMany",
                "count",
                "aggregate",
                "groupBy",
              ].includes(operation)
            ) {
              const currentWhere = typedArgs.where || {};
              typedArgs.where = {
                ...currentWhere,
                [tenantField]: storeId,
              };
            }

            // Inject tenant field into create operations
            if (operation === "create" || operation === "createMany") {
              const currentData = typedArgs.data || {};

              if (Array.isArray(currentData)) {
                typedArgs.data = currentData.map((item) => ({
                  ...item,
                  [tenantField]: storeId,
                }));
              } else {
                typedArgs.data = {
                  ...currentData,
                  [tenantField]: storeId,
                };
              }
            }
          }

          return query(args);
        },
      },
    },
  });
};
