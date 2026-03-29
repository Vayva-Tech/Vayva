import { FastifyPluginAsync } from "fastify";
import { BeautyService } from "../../../../services/platform/beauty.service";
import { z } from "zod";

const beautyService = new BeautyService();

export const beautyRoutes: FastifyPluginAsync = async (server) => {
  // ==================== Skin Profiles Routes ====================

  /**
   * GET /api/v1/beauty/:storeId/customers/:customerId/skin-profile
   * Get skin profile for a customer
   */
  server.get("/:storeId/customers/:customerId/skin-profile", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId, customerId } = request.params;
      const profile = await beautyService.getSkinProfile(storeId, customerId);

      if (!profile) {
        return reply
          .code(404)
          .send({ success: false, error: "Skin profile not found" });
      }

      return reply.send({ success: true, data: profile });
    },
  });

  /**
   * POST /api/v1/beauty/:storeId/skin-profiles
   * Create a new skin profile
   */
  server.post("/:storeId/skin-profiles", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const profile = await beautyService.createSkinProfile(
          request.params.storeId,
          request.body,
        );
        return reply.send({ success: true, data: profile });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create skin profile",
        });
      }
    },
  });

  /**
   * PUT /api/v1/beauty/:storeId/customers/:customerId/skin-profile
   * Update an existing skin profile
   */
  server.put("/:storeId/customers/:customerId/skin-profile", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId, customerId } = request.params;
      const updateData = request.body;

      try {
        const profile = await beautyService.updateSkinProfile(
          storeId,
          customerId,
          updateData,
        );
        return reply.send({ success: true, data: profile });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update skin profile",
        });
      }
    },
  });

  // ==================== Product Shades Routes ====================

  /**
   * GET /api/v1/beauty/products/:productId/shades
   * Get all shades for a product
   */
  server.get("/products/:productId/shades", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { productId } = request.params;
      const shades = await beautyService.getProductShades(productId);
      return reply.send({ success: true, data: shades });
    },
  });

  /**
   * POST /api/v1/beauty/shades
   * Create a new product shade
   */
  server.post("/shades", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const shade = await beautyService.createProductShade(request.body);
        return reply.send({ success: true, data: shade });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create product shade",
        });
      }
    },
  });

  // ==================== Routine Builders Routes ====================

  /**
   * GET /api/v1/beauty/:storeId/routine-builders
   * Get all routine builders for a store
   */
  server.get("/:storeId/routine-builders", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const routines = await beautyService.getRoutineBuilders(storeId);
      return reply.send({ success: true, data: routines });
    },
  });

  /**
   * POST /api/v1/beauty/:storeId/routine-builders
   * Create a new routine builder
   */
  server.post("/:storeId/routine-builders", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const routine = await beautyService.createRoutineBuilder(
          request.params.storeId,
          request.body,
        );
        return reply.send({ success: true, data: routine });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create routine builder",
        });
      }
    },
  });

  server.log.info("[BeautyRoutes] Registered beauty routes");
};
