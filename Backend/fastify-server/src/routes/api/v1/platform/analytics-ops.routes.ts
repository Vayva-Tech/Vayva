import { FastifyPluginAsync } from "fastify";
import { AnalyticsService } from "../../../../services/platform/analytics.service";

const service = new AnalyticsService();

export const analyticsOpsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/analytics/ops/comprehensive
  server.get("/ops/comprehensive", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getComprehensiveAnalytics();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch comprehensive analytics",
        });
      }
    },
  });

  // GET /api/v1/analytics/ops/dashboard
  server.get("/ops/dashboard", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getDashboardStats();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard stats",
        });
      }
    },
  });

  // GET /api/v1/analytics/ops/platform
  server.get("/ops/platform", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getPlatformBreakdown();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch platform breakdown",
        });
      }
    },
  });

  // GET /api/v1/analytics/ops/timeseries
  server.get("/ops/timeseries", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const metric = query.metric || "gmv";
      const period = query.period || "30d";
      const granularity = query.granularity || "day";

      const periodDays =
        period === "7d"
          ? 7
          : period === "90d"
            ? 90
            : period === "1y"
              ? 365
              : 30;

      try {
        const result = await service.getTimeSeries(
          metric,
          periodDays,
          granularity,
        );
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch time series",
        });
      }
    },
  });

  // GET /api/v1/analytics/ops/csat
  server.get("/ops/csat", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getCsatScores();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch CSAT scores",
        });
      }
    },
  });
};
