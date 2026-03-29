import { FastifyPluginAsync } from "fastify";
import { ElectronicsService } from "../../../../services/platform/electronics.service";
import { z } from "zod";

const electronicsService = new ElectronicsService();

export const electronicsRoutes: FastifyPluginAsync = async (server) => {
  // ==================== Vehicle History Routes ====================

  /**
   * GET /api/v1/electronics/vehicles/:vehicleId/history
   * Get vehicle history report
   */
  server.get("/vehicles/:vehicleId/history", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { vehicleId } = request.params;
      const history = await electronicsService.getVehicleHistory(vehicleId);

      if (!history) {
        return reply
          .code(404)
          .send({ success: false, error: "Vehicle history not found" });
      }

      return reply.send({ success: true, data: history });
    },
  });

  /**
   * POST /api/v1/electronics/vehicle-history
   * Create vehicle history report
   */
  server.post("/vehicle-history", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const history = await electronicsService.createVehicleHistory(
          request.body,
        );
        return reply.send({ success: true, data: history });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create vehicle history",
        });
      }
    },
  });

  // ==================== Trade-In Valuations Routes ====================

  /**
   * GET /api/v1/electronics/:storeId/trade-ins
   * Get all trade-in valuations for a store
   */
  server.get("/:storeId/trade-ins", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { status } = request.query;

      const valuations = await electronicsService.getTradeInValuations(
        storeId,
        status,
      );
      return reply.send({ success: true, data: valuations });
    },
  });

  /**
   * GET /api/v1/electronics/trade-ins/customer/:customerId
   * Get trade-ins for a specific customer
   */
  server.get("/trade-ins/customer/:customerId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { customerId } = request.params;
      const tradeIns = await electronicsService.getCustomerTradeIns(customerId);
      return reply.send({ success: true, data: tradeIns });
    },
  });

  /**
   * POST /api/v1/electronics/trade-ins
   * Create a new trade-in valuation
   */
  server.post("/trade-ins", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const valuation = await electronicsService.createTradeInValuation(
          request.body,
        );
        return reply.send({ success: true, data: valuation });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create trade-in valuation",
        });
      }
    },
  });

  /**
   * PUT /api/v1/electronics/trade-ins/:id/offer
   * Update trade-in offer price
   */
  server.put("/trade-ins/:id/offer", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { storeId, offerPrice, notes } = request.body;

      try {
        const valuation = await electronicsService.updateTradeInOffer(
          id,
          storeId,
          offerPrice,
          notes,
        );
        return reply.send({ success: true, data: valuation });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update trade-in offer",
        });
      }
    },
  });

  /**
   * POST /api/v1/electronics/trade-ins/:id/accept
   * Accept a trade-in offer
   */
  server.post("/trade-ins/:id/accept", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const storeId = (request.user as any).storeId;

      try {
        const valuation = await electronicsService.acceptTradeInOffer(
          id,
          storeId,
        );
        return reply.send({ success: true, data: valuation });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to accept trade-in offer",
        });
      }
    },
  });

  // ==================== Lead Scoring Routes ====================

  /**
   * GET /api/v1/electronics/:storeId/customers/:customerId/lead-score
   * Get lead score for a customer
   */
  server.get("/:storeId/customers/:customerId/lead-score", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId, customerId } = request.params;
      const leadScore = await electronicsService.getLeadScore(
        storeId,
        customerId,
      );

      if (!leadScore) {
        return reply
          .code(404)
          .send({ success: false, error: "Lead score not found" });
      }

      return reply.send({ success: true, data: leadScore });
    },
  });

  /**
   * PUT /api/v1/electronics/:storeId/customers/:customerId/lead-score
   * Update or create lead score
   */
  server.put("/:storeId/customers/:customerId/lead-score", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId, customerId } = request.params;
      const { inquiryType, factors } = request.body;

      try {
        const leadScore = await electronicsService.updateLeadScore(
          storeId,
          customerId,
          {
            inquiryType,
            factors,
          },
        );
        return reply.send({ success: true, data: leadScore });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update lead score",
        });
      }
    },
  });

  /**
   * GET /api/v1/electronics/:storeId/leads/high-value
   * Get high-value leads with minimum score threshold
   */
  server.get("/:storeId/leads/high-value", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { minScore } = request.query;

      const leads = await electronicsService.getHighValueLeads(
        storeId,
        minScore,
      );
      return reply.send({ success: true, data: leads });
    },
  });

  // ==================== Market Price Analysis Routes ====================

  /**
   * GET /api/v1/electronics/vehicles/:vehicleId/market-analysis
   * Get market price analysis for a vehicle
   */
  server.get("/vehicles/:vehicleId/market-analysis", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { vehicleId } = request.params;
      const analysis =
        await electronicsService.getMarketPriceAnalysis(vehicleId);

      if (!analysis) {
        return reply
          .code(404)
          .send({ success: false, error: "Market analysis not found" });
      }

      return reply.send({ success: true, data: analysis });
    },
  });

  // ==================== Warranty Records Routes ====================

  /**
   * GET /api/v1/electronics/warranties/order/:orderId
   * Get warranties for an order
   */
  server.get("/warranties/order/:orderId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { orderId } = request.params;
      const warranties = await electronicsService.getWarrantyByOrder(orderId);
      return reply.send({ success: true, data: warranties });
    },
  });

  /**
   * GET /api/v1/electronics/warranties/customer/:customerId
   * Get warranties for a customer
   */
  server.get("/warranties/customer/:customerId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { customerId } = request.params;
      const warranties =
        await electronicsService.getCustomerWarranties(customerId);
      return reply.send({ success: true, data: warranties });
    },
  });

  /**
   * POST /api/v1/electronics/warranties
   * Create a new warranty record
   */
  server.post("/warranties", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const warranty = await electronicsService.createWarranty(request.body);
        return reply.send({ success: true, data: warranty });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create warranty",
        });
      }
    },
  });

  /**
   * PUT /api/v1/electronics/warranties/:id/status
   * Update warranty status
   */
  server.put("/warranties/:id/status", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { storeId, status } = request.body;

      try {
        const warranty = await electronicsService.updateWarrantyStatus(
          id,
          storeId,
          status,
        );
        return reply.send({ success: true, data: warranty });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update warranty status",
        });
      }
    },
  });

  /**
   * GET /api/v1/electronics/:storeId/warranties/expiring
   * Get expiring warranties within threshold days
   */
  server.get("/:storeId/warranties/expiring", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { daysThreshold } = request.query;

      const warranties = await electronicsService.getExpiringWarranties(
        storeId,
        daysThreshold,
      );
      return reply.send({ success: true, data: warranties });
    },
  });

  server.log.info("[ElectronicsRoutes] Registered electronics routes");
};
