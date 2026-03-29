import { FastifyPluginAsync } from "fastify";
import { InventoryService } from "../../../../services/inventory/inventory.service";

const inventoryService = new InventoryService();

export const inventoryRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /inventory/stock/:variantId
   * Get stock level for a variant
   */
  server.get("/stock/:variantId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { variantId } = request.params as { variantId: string };
      const { locationId } = request.query as { locationId?: string };

      const stock = await inventoryService.getStock(
        storeId,
        variantId,
        locationId,
      );

      if (!stock) {
        return reply
          .code(404)
          .send({ success: false, error: "Stock not found" });
      }

      return reply.send({ success: true, data: stock });
    },
  });

  /**
   * GET /inventory/stock/:variantId/locations
   * Get stock across all locations
   */
  server.get("/stock/:variantId/locations", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { variantId } = request.params as { variantId: string };

      const locations = await inventoryService.getMultiLocationStock(
        storeId,
        variantId,
      );
      return reply.send({ success: true, data: locations });
    },
  });

  /**
   * GET /inventory/low-stock
   * Get low stock items
   */
  server.get("/low-stock", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { threshold } = request.query as { threshold?: number };

      const items = await inventoryService.getLowStockItems(storeId, threshold);
      return reply.send({ success: true, data: items });
    },
  });

  /**
   * POST /inventory/adjust
   * Adjust stock
   */
  server.post("/adjust", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const adjustment = request.body as any;

      const result = await inventoryService.adjustStock({
        ...adjustment,
        storeId,
      });

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.send(result);
    },
  });

  /**
   * POST /inventory/deplete
   * Deplete stock on order fulfillment
   */
  server.post("/deplete", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { items } = request.body as { items: any[] };

      const result = await inventoryService.depleteOnOrder(storeId, items);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return reply.send(result);
    },
  });

  /**
   * POST /inventory/receive
   * Receive stock
   */
  server.post("/receive", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { items } = request.body as { items: any[] };

      const result = await inventoryService.receiveStock(storeId, items);
      return reply.send(result);
    },
  });

  /**
   * POST /inventory/transfer
   * Transfer stock between locations
   */
  server.post("/transfer", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const transferData = request.body as any;

      try {
        const result = await inventoryService.transferStock(
          storeId,
          transferData,
        );
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Transfer failed",
        });
      }
    },
  });

  /**
   * POST /inventory/cycle-count
   * Cycle count
   */
  server.post("/cycle-count", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { counts } = request.body as { counts: any[] };

      const result = await inventoryService.cycleCount(storeId, counts);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /inventory/movements/:variantId
   * Get movement history
   */
  server.get("/movements/:variantId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { variantId } = request.params as { variantId: string };
      const options = request.query as any;

      const movements = await inventoryService.getMovementHistory(
        storeId,
        variantId,
        options,
      );
      return reply.send({ success: true, data: movements });
    },
  });
};
