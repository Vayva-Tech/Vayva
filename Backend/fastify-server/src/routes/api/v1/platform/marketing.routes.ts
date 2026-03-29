import { FastifyPluginAsync } from "fastify";
import { MarketingService } from "../../../../services/platform/marketing.service";
import { z } from "zod";

const marketingService = new MarketingService();

export const marketingRoutes: FastifyPluginAsync = async (server) => {
  server.get("/flash-sales", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const result = await marketingService.getFlashSales(storeId);
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post("/flash-sales", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const saleData = request.body as any;

      try {
        const flashSale = await marketingService.createFlashSale(
          storeId,
          saleData,
        );
        return reply.code(201).send({ success: true, data: flashSale });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create flash sale",
        });
      }
    },
  });

  server.put("/flash-sales/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const flashSale = await marketingService.updateFlashSale(
          id,
          storeId,
          updates,
        );
        return reply.send({ success: true, data: flashSale });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update flash sale",
        });
      }
    },
  });

  server.get("/discounts", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const discounts = await marketingService.getDiscounts(storeId);
      return reply.send({ success: true, data: discounts });
    },
  });

  server.post("/discounts", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const discountData = request.body as any;

      try {
        const discount = await marketingService.createDiscount(
          storeId,
          discountData,
        );
        return reply.code(201).send({ success: true, data: discount });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create discount",
        });
      }
    },
  });

  server.put("/discounts/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const discount = await marketingService.updateDiscount(
          id,
          storeId,
          updates,
        );
        return reply.send({ success: true, data: discount });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update discount",
        });
      }
    },
  });

  server.get("/affiliates", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const affiliates = await marketingService.getAffiliates(storeId);
      return reply.send({ success: true, data: affiliates });
    },
  });

  server.post("/affiliates", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const affiliateData = request.body as any;

      try {
        const affiliate = await marketingService.createAffiliate(
          storeId,
          affiliateData,
        );
        return reply.code(201).send({ success: true, data: affiliate });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create affiliate",
        });
      }
    },
  });

  server.post("/affiliates/referrals", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { affiliateId, customerId, orderId } = request.body as any;

      try {
        const referral = await marketingService.trackAffiliateReferral(
          affiliateId,
          customerId,
          orderId,
        );
        return reply.code(201).send({ success: true, data: referral });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to track referral",
        });
      }
    },
  });

  // ==================== Campaign Management Routes ====================

  /**
   * GET /api/v1/marketing/campaigns
   * Get all campaigns for a store
   */
  server.get("/campaigns", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const filters = request.query;
      const campaigns = await marketingService.getCampaigns(storeId, filters);
      return reply.send({ success: true, data: campaigns });
    },
  });

  /**
   * GET /api/v1/marketing/campaigns/:id
   * Get campaign by ID
   */
  server.get("/campaigns/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;
      const campaign = await marketingService.getCampaignById(id, storeId);
      return reply.send({ success: true, data: campaign });
    },
  });

  /**
   * POST /api/v1/marketing/campaigns
   * Create a new campaign
   */
  server.post("/campaigns", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const campaignData = request.body as any;

      try {
        const campaign = await marketingService.createCampaign(
          storeId,
          campaignData,
        );
        return reply.code(201).send({ success: true, data: campaign });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create campaign",
        });
      }
    },
  });

  /**
   * PATCH /api/v1/marketing/campaigns/:id
   * Update a campaign
   */
  server.patch("/campaigns/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;
      const updates = request.body as any;

      try {
        const campaign = await marketingService.updateCampaign(
          id,
          storeId,
          updates,
        );
        return reply.send({ success: true, data: campaign });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update campaign",
        });
      }
    },
  });

  /**
   * DELETE /api/v1/marketing/campaigns/:id
   * Delete a campaign
   */
  server.delete("/campaigns/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;

      try {
        await marketingService.deleteCampaign(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete campaign",
        });
      }
    },
  });

  /**
   * POST /api/v1/marketing/campaigns/:id/send
   * Send a campaign
   */
  server.post("/campaigns/:id/send", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;

      try {
        const campaign = await marketingService.sendCampaign(id, storeId);
        return reply.send({ success: true, data: campaign });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to send campaign",
        });
      }
    },
  });

  // ==================== Promotions Routes ====================

  /**
   * GET /api/v1/marketing/promotions
   * Get all promotions
   */
  server.get("/promotions", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const filters = request.query;

      const promotions = await marketingService.getPromotions(storeId, filters);
      return reply.send({ success: true, data: promotions });
    },
  });

  /**
   * GET /api/v1/marketing/promotions/:id
   * Get promotion by ID
   */
  server.get("/promotions/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;

      const promotion = await marketingService.getPromotionById(id, storeId);
      return reply.send({ success: true, data: promotion });
    },
  });

  /**
   * POST /api/v1/marketing/promotions
   * Create a new promotion
   */
  server.post("/promotions", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const promotionData = request.body as any;

      try {
        const promotion = await marketingService.createPromotion(
          storeId,
          promotionData,
        );
        return reply.code(201).send({ success: true, data: promotion });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create promotion",
        });
      }
    },
  });

  /**
   * PATCH /api/v1/marketing/promotions/:id
   * Update a promotion
   */
  server.patch("/promotions/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;
      const updates = request.body as any;

      try {
        const promotion = await marketingService.updatePromotion(
          id,
          storeId,
          updates,
        );
        return reply.send({ success: true, data: promotion });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update promotion",
        });
      }
    },
  });

  /**
   * DELETE /api/v1/marketing/promotions/:id
   * Delete a promotion
   */
  server.delete("/promotions/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;

      try {
        await marketingService.deletePromotion(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete promotion",
        });
      }
    },
  });

  // ==================== Customer Segments Routes ====================

  /**
   * GET /api/v1/marketing/segments
   * Get all customer segments
   */
  server.get("/segments", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const segments = await marketingService.getSegments(storeId);
      return reply.send({ success: true, data: segments });
    },
  });

  /**
   * GET /api/v1/marketing/segments/:id
   * Get segment by ID
   */
  server.get("/segments/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;

      const segment = await marketingService.getSegmentById(id, storeId);
      return reply.send({ success: true, data: segment });
    },
  });

  /**
   * POST /api/v1/marketing/segments
   * Create a new segment
   */
  server.post("/segments", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const segmentData = request.body as any;

      try {
        const segment = await marketingService.createSegment(
          storeId,
          segmentData,
        );
        return reply.code(201).send({ success: true, data: segment });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create segment",
        });
      }
    },
  });

  /**
   * PATCH /api/v1/marketing/segments/:id
   * Update a segment
   */
  server.patch("/segments/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params;
      const updates = request.body as any;

      try {
        const segment = await marketingService.updateSegment(
          id,
          storeId,
          updates,
        );
        return reply.send({ success: true, data: segment });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update segment",
        });
      }
    },
  });
};
