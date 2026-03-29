import { FastifyPluginAsync } from "fastify";
import { DiscountRulesService } from "../../../../services/commerce/discountRules.service";

/**
 * Stub routes for endpoints the frontend calls but don't have full implementations yet.
 * These return empty data so the frontend doesn't break.
 */
export const stubRoutes: FastifyPluginAsync = async (server) => {
  // Discounts (alias for discount-rules)
  const discountRulesService = new DiscountRulesService();

  server.get("/discounts", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        active: query.active,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      const result = await discountRulesService.findAll(storeId, filters);
      return reply.send({ success: true, discounts: result.rules || [] });
    },
  });

  server.post("/discounts", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const rule = await discountRulesService.create(storeId, data);
        return reply.code(201).send({ success: true, discount: rule });
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

  // AB Testing
  server.get("/ab-testing/tests", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  server.post("/ab-testing/tests", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.code(201).send({ success: true, data: { id: "stub" } });
    },
  });

  // Blog Media
  server.get("/blog-media/posts", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  server.get("/blog-media/calendar", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  server.get("/blog-media/stats", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({
        success: true,
        data: { total: 0, published: 0, draft: 0 },
      });
    },
  });

  // Blog
  server.get("/blog/posts", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Designer
  server.get("/designer", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: {} });
    },
  });

  server.get("/designer/stats", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: { total: 0 } });
    },
  });

  // Digital Assets
  server.get("/digital-assets", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Editor Data
  server.get("/editor-data/extensions", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Telemetry
  server.post("/telemetry/event", {
    handler: async (_request, reply) => {
      return reply.send({ success: true });
    },
  });

  // Account domains (stub)
  server.get("/account/domains", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Affiliate dashboard (stub)
  server.get("/affiliate/dashboard", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({
        success: true,
        stats: { totalReferrals: 0, totalEarnings: 0, pendingPayouts: 0 },
        referrals: [],
        payouts: [],
        affiliate: { code: "" },
      });
    },
  });

  // Appeals (stub)
  server.get("/appeals", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Applications (stub)
  server.get("/applications", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Appointments (stub)
  server.get("/appointments", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });

  // Services (stub)
  server.get("/services", {
    preHandler: [server.authenticate],
    handler: async (_request, reply) => {
      return reply.send({ success: true, data: [] });
    },
  });
};
