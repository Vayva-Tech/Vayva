import { FastifyPluginAsync } from "fastify";
import { ComplianceService } from "../../../../services/platform/compliance.service";

const service = new ComplianceService();

export const complianceOpsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/compliance/sessions/ops
  server.get("/sessions/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getActiveSessions();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch sessions",
        });
      }
    },
  });

  // GET /api/v1/compliance/kyc/ops
  server.get("/kyc/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getKycQueue();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch KYC queue",
        });
      }
    },
  });

  // POST /api/v1/compliance/kyc/ops/action
  server.post<{
    Body: {
      id: string;
      action: "approve" | "reject";
      notes?: string;
      rejectionReason?: string;
    };
  }>("/kyc/ops/action", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as any;
      const { id, action, notes, rejectionReason } = request.body;

      if (!id || !["approve", "reject"].includes(action)) {
        return reply.code(400).send({
          success: false,
          error: "Invalid request: id and action (approve/reject) are required",
        });
      }

      try {
        const result = await service.processKycAction(
          id,
          user.id,
          user.email,
          action,
          notes,
          rejectionReason,
        );

        return reply.send(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "KYC record not found"
        ) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to process KYC action",
        });
      }
    },
  });

  // POST /api/v1/compliance/kyc/ops/assign
  server.post<{ Body: { kycIds: string[]; reviewerId: string } }>(
    "/kyc/ops/assign",
    {
      preHandler: [server.authenticate],
      handler: async (request, reply) => {
        const user = request.user as any;
        const { kycIds, reviewerId } = request.body;

        if (!kycIds || !Array.isArray(kycIds) || kycIds.length === 0) {
          return reply.code(400).send({
            success: false,
            error: "kycIds array is required",
          });
        }

        if (!reviewerId) {
          return reply.code(400).send({
            success: false,
            error: "reviewerId is required",
          });
        }

        try {
          const result = await service.assignKycRecords(
            kycIds,
            reviewerId,
            user.id,
            user.email,
          );

          return reply.send(result);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Reviewer not found"
          ) {
            return reply.code(404).send({
              success: false,
              error: error.message,
            });
          }
          if (error instanceof Error && error.message.includes("privileges")) {
            return reply.code(403).send({
              success: false,
              error: error.message,
            });
          }
          return reply.code(500).send({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to assign KYC records",
          });
        }
      },
    },
  );

  // GET /api/v1/compliance/kyc/ops/reviewers
  server.get("/kyc/ops/reviewers", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getKycReviewers();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch reviewers",
        });
      }
    },
  });

  // DELETE /api/v1/compliance/sessions/:id
  server.delete<{ Params: { id: string } }>("/sessions/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as any;
      const sessionId = request.params.id;

      try {
        const result = await service.revokeSession(sessionId, user.id);
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to revoke session",
        });
      }
    },
  });

  // GET /api/v1/compliance/security/logs/ops
  server.get("/security/logs/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const page = parseInt(query.page || "1");
      const limit = parseInt(query.limit || "50");

      try {
        const result = await service.getSecurityLogs({
          page,
          limit,
          type: query.type,
          userId: query.userId,
        });

        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch security logs",
        });
      }
    },
  });

  // GET /api/v1/compliance/security/stats/ops
  server.get("/security/stats/ops", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const result = await service.getSecurityStats();
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch security stats",
        });
      }
    },
  });
};
