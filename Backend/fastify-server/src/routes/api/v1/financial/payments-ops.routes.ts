import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PaymentsService } from "../../../../services/financial/payments.service";

const service = new PaymentsService();

export const paymentsOpsRoutes: FastifyPluginAsync = async (
  server: FastifyInstance,
) => {
  // GET /api/v1/financial/payments/ops
  server.get("/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const status = query.status || "all";

      try {
        const [payments, stats] = await Promise.all([
          service.getOpsPayments("", status, 100),
          service.getPaymentStats(),
        ]);

        return reply.send({ payments, stats });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch payments",
        });
      }
    },
  });

  // GET /api/v1/financial/wallet-funding/ops
  server.get("/wallet-funding/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const page = parseInt(query.page || "1");
      const limit = Math.min(parseInt(query.limit || "20"), 100);

      try {
        const result = await service.getWalletFunding({
          page,
          limit,
          q: query.q,
          storeId: query.storeId,
        });

        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch wallet funding",
        });
      }
    },
  });

  // GET /api/v1/financial/payouts/ops
  server.get("/payouts/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const status = query.status || "PENDING";

      try {
        const data = await service.getPayouts(status);
        return reply.send({ data });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch payouts",
        });
      }
    },
  });

  // GET /api/v1/financial/webhooks/ops
  server.get("/webhooks/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const page = parseInt(query.page || "1");
      const limit = Math.min(parseInt(query.limit || "20"), 100);

      try {
        const result = await service.getWebhookEvents({
          page,
          limit,
          q: query.q,
          status: query.status,
          storeId: query.storeId,
        });

        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch webhook events",
        });
      }
    },
  });

  // POST /api/v1/financial/webhooks/:id/reprocess
  server.post<{ Params: { id: string }; Body: { reason?: string } }>(
    "/webhooks/:id/reprocess",
    {
      preHandler: [server.authenticate],
      handler: async (request, reply) => {
        const user = request.user as any;
        const eventId = request.params.id;
        const { reason = "Manual reprocessing by operator" } =
          request.body || {};

        try {
          const result = await service.reprocessWebhook(
            eventId,
            user.id,
            user.email,
            reason,
          );

          return reply.send(result);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Event already processed"
          ) {
            return reply.code(409).send({
              success: false,
              error: error.message,
            });
          }
          return reply.code(500).send({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to reprocess webhook",
          });
        }
      },
    },
  );

  // POST /api/v1/financial/wallet-funding/:storeId/reconcile
  server.post<{
    Params: { storeId: string };
    Body: { reason: string; amountKobo: number };
  }>("/wallet-funding/:storeId/reconcile", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as any;
      const storeId = request.params.storeId;
      const { reason, amountKobo } = request.body;

      if (!reason || reason.trim().length < 10) {
        return reply.code(400).send({
          success: false,
          error: "Reason is required (min 10 characters)",
        });
      }

      if (!amountKobo || typeof amountKobo !== "number" || amountKobo <= 0) {
        return reply.code(400).send({
          success: false,
          error: "Valid amountKobo (positive number) is required",
        });
      }

      try {
        const result = await service.reconcileWalletFunding(
          storeId,
          user.id,
          user.email,
          reason,
          amountKobo,
        );

        return reply.send(result);
      } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes("locked")) {
          return reply.code(409).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to reconcile wallet",
        });
      }
    },
  });
};
