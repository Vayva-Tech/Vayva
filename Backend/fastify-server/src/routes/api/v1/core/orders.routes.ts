import { FastifyPluginAsync } from "fastify";
import { OrdersService } from "../../../../services/core/orders.service";

const ordersService = new OrdersService();

export const ordersRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/orders
   * Get all orders for store with filtering
   */
  server.get("/", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        paymentStatus: query.paymentStatus,
        fulfillmentStatus: query.fulfillmentStatus,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        search: query.search,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await ordersService.getStoreOrders(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/orders
   * Create a new order
   */
  server.post("/", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const orderData = request.body as any;

      try {
        const order = await ordersService.createOrder({
          ...orderData,
          storeId,
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
   * GET /api/v1/orders/:orderId
   * Get order by ID
   */
  server.get("/:orderId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { orderId } = request.params as { orderId: string };

      const order = await ordersService.getOrderById(orderId, storeId);

      if (!order) {
        return reply
          .code(404)
          .send({ success: false, error: "Order not found" });
      }

      return reply.send({ success: true, data: order });
    },
  });

  /**
   * PUT /api/v1/orders/:orderId/status
   * Update order status
   */
  server.put("/:orderId/status", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { orderId } = request.params as { orderId: string };
      const { status, reason } = request.body as {
        status: string;
        reason?: string;
      };

      try {
        const updated = await ordersService.updateOrderStatus(
          orderId,
          storeId,
          status,
          { reason },
        );
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update status",
        });
      }
    },
  });

  /**
   * POST /api/v1/orders/:orderId/payment
   * Update payment status
   */
  server.post("/:orderId/payment", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { orderId } = request.params as { orderId: string };
      const { paymentStatus, transaction } = request.body as {
        paymentStatus: string;
        transaction?: any;
      };

      try {
        const updated = await ordersService.updatePaymentStatus(
          orderId,
          storeId,
          paymentStatus,
          transaction,
        );
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update payment",
        });
      }
    },
  });

  /**
   * POST /api/v1/orders/:orderId/fulfillment
   * Update fulfillment status
   */
  server.post("/:orderId/fulfillment", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { orderId } = request.params as { orderId: string };
      const { fulfillmentStatus, tracking } = request.body as {
        fulfillmentStatus: string;
        tracking?: {
          trackingNumber: string;
          trackingUrl: string;
          carrier: string;
        };
      };

      try {
        const updated = await ordersService.updateFulfillmentStatus(
          orderId,
          storeId,
          fulfillmentStatus,
          tracking,
        );
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update fulfillment",
        });
      }
    },
  });

  /**
   * DELETE /api/v1/orders/:orderId
   * Cancel order
   */
  server.delete("/:orderId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { orderId } = request.params as { orderId: string };
      const { reason } = request.body as { reason: string };

      try {
        await ordersService.cancelOrder(orderId, storeId, reason);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to cancel order",
        });
      }
    },
  });

  /**
   * GET /api/v1/orders/stats
   * Get order statistics
   */
  server.get("/stats/overview", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { from, to } = request.query as { from?: string; to?: string };

      const period = {
        from: from
          ? new Date(from)
          : new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: to ? new Date(to) : new Date(),
      };

      const stats = await ordersService.getOrderStats(storeId, period);
      return reply.send({ success: true, data: stats });
    },
  });
};
