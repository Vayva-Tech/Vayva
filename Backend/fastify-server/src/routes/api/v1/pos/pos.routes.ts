import { FastifyPluginAsync } from "fastify";
import { posService } from "../../../../services/pos/pos.service";
import { z } from "zod";

const posRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/pos/items
   * Get all POS items for store
   */
  server.get("/items", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { type, search } = request.query as {
        type?: string;
        search?: string;
      };

      try {
        const items = await posService.getStorePOSItems(user.storeId, {
          type,
          search,
        });
        return reply.send({
          success: true,
          data: items,
          count: items.length,
        });
      } catch (error) {
        server.log.error({ error }, "Failed to fetch POS items");
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch items",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/items
   * Create a new POS item
   */
  server.post("/items", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const body = request.body as any;

      try {
        const item = await posService.createPOSTable({
          ...body,
          storeId: user.storeId,
        });
        return reply.code(201).send({ success: true, data: item });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create item",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/items/:id
   * Get a single POS item
   */
  server.get<{ Params: { id: string } }>("/items/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { id } = request.params;

      try {
        const item = await posService.getPOSTableById(id, user.storeId);
        return reply.send({ success: true, data: item });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : "Item not found",
        });
      }
    },
  });

  /**
   * PUT /api/v1/pos/items/:id
   * Update a POS item
   */
  server.put<{ Params: { id: string } }>("/items/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { id } = request.params;
      const updates = request.body as any;

      try {
        const item = await posService.updatePOSTable(id, user.storeId, updates);
        return reply.send({ success: true, data: item });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update item",
        });
      }
    },
  });

  /**
   * DELETE /api/v1/pos/items/:id
   * Delete a POS item
   */
  server.delete<{ Params: { id: string } }>("/items/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { id } = request.params;

      try {
        await posService.deletePOSTable(id, user.storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete item",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/orders
   * Create POS order
   */
  server.post("/orders", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const body = request.body as any;

      try {
        const order = await posService.createPOSOrder({
          ...body,
          storeId: user.storeId,
        });
        return reply.code(201).send({ success: true, data: order });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create order",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/orders/:id
   * Get POS order details
   */
  server.get<{ Params: { orderId: string } }>("/orders/:orderId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId } = request.params;

      try {
        const order = await posService.getPOSOrder(orderId, user.storeId);
        return reply.send({ success: true, data: order });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : "Order not found",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/orders/:orderId/payments/split
   * Process split payment
   */
  server.post<{ Params: { orderId: string } }>(
    "/orders/:orderId/payments/split",
    {
      preHandler: [server.authenticate],
      handler: async (request, reply) => {
        const user = request.user as { storeId: string };
        const { orderId } = request.params;
        const { payments } = request.body as {
          payments: Array<{ method: string; amount: number }>;
        };

        try {
          const result = await posService.processSplitPayment(
            orderId,
            user.storeId,
            payments,
          );
          return reply.send({ success: true, data: result });
        } catch (error) {
          return reply.code(400).send({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to process payment",
          });
        }
      },
    },
  );

  /**
   * GET /api/v1/pos/orders/:orderId/receipt
   * Generate receipt
   */
  server.get<{ Params: { orderId: string } }>("/orders/:orderId/receipt", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId } = request.params;

      try {
        const receipt = await posService.generateReceipt(orderId, user.storeId);
        return reply.send({ success: true, data: receipt });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : "Receipt not found",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/stats/today
   * Get today's POS statistics
   */
  server.get("/stats/today", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };

      try {
        const stats = await posService.getTodayStats(user.storeId);
        return reply.send({ success: true, data: stats });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch stats",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/orders/recent
   * Get recent POS orders
   */
  server.get("/orders/recent", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { limit } = request.query as { limit?: string };

      try {
        const orders = await posService.getRecentOrders(
          user.storeId,
          limit ? parseInt(limit, 10) : 20,
        );
        return reply.send({ success: true, data: orders });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch orders",
        });
      }
    },
  });
};

export default posRoutes;
