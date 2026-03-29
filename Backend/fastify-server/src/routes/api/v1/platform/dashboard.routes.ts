import { FastifyPluginAsync } from "fastify";
import { DashboardService } from "../../../../services/platform/dashboard.service";

const dashboardService = new DashboardService();

export const dashboardRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/dashboard/aggregate - All-in-one dashboard data
  server.get("/aggregate", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const range = (request.query as any).range || "month";

        const data = await dashboardService.getAggregateData(
          storeId,
          range as "today" | "week" | "month",
        );
        return reply.send({ success: true, data });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "DASHBOARD_FETCH_ERROR",
            message: "Failed to fetch dashboard data",
          },
        });
      }
    },
  });

  // GET /api/v1/dashboard/kpis - KPI metrics only
  server.get("/kpis", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const kpis = await dashboardService.getKpis(storeId);
        return reply.send({ success: true, data: kpis });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: { code: "KPI_FETCH_ERROR", message: "Failed to fetch KPIs" },
        });
      }
    },
  });

  // GET /api/v1/dashboard/alerts - Active alerts
  server.get("/alerts", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const alerts = await dashboardService.getAlerts(storeId);
        return reply.send({ success: true, data: alerts });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "ALERT_FETCH_ERROR",
            message: "Failed to fetch alerts",
          },
        });
      }
    },
  });

  // GET /api/v1/dashboard/actions - Suggested actions
  server.get("/actions", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const actions = await dashboardService.getSuggestedActions(storeId);
        return reply.send({ success: true, data: actions });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "ACTION_FETCH_ERROR",
            message: "Failed to fetch suggested actions",
          },
        });
      }
    },
  });

  // GET /api/v1/dashboard/trends/:metric - Trend data for specific metric
  server.get("/trends/:metric", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { metric } = request.params as { metric: string };
        const period = (request.query as any).period || "30d";

        const trends = await dashboardService.getTrends(
          storeId,
          metric,
          period as "7d" | "30d" | "90d",
        );
        return reply.send({ success: true, data: trends });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "TREND_FETCH_ERROR",
            message: "Failed to fetch trend data",
          },
        });
      }
    },
  });

  // POST /api/v1/dashboard/refresh - Force refresh cached data
  server.post("/refresh", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        await dashboardService.refreshCache(storeId);
        return reply.send({
          success: true,
          message: "Dashboard cache refreshed",
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "REFRESH_ERROR",
            message: "Failed to refresh dashboard data",
          },
        });
      }
    },
  });

  // Legacy routes (keep for backward compatibility)
  server.get("/metrics", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const metrics = await dashboardService.getMetrics(storeId);
      return reply.send({ success: true, data: metrics });
    },
  });

  server.get("/stats", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const period = {
        from: query.fromDate
          ? new Date(query.fromDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: query.toDate ? new Date(query.toDate) : new Date(),
      };

      const stats = await dashboardService.getDashboardStats(storeId, period);
      return reply.send({ success: true, data: stats });
    },
  });

  // GET /api/v1/dashboard/activity - Recent activity feed
  server.get("/activity", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const limit = parseInt((request.query as any).limit || "15");

      const data = await dashboardService.getAggregateData(storeId, "today");
      const orders = data.recentOrders || [];

      return reply.send({
        success: true,
        data: orders.slice(0, limit).map((o: any) => ({
          id: o.id,
          type: "order",
          message: `New order from ${o.customerName || "Customer"}`,
          amount: o.total,
          time: o.createdAt,
        })),
      });
    },
  });

  // GET /api/v1/dashboard/analytics - Dashboard analytics
  server.get("/analytics", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const range = (request.query as any).range || "month";

      const data = await dashboardService.getAggregateData(
        storeId,
        range as "today" | "week" | "month",
      );
      return reply.send({ success: true, data });
    },
  });
};
