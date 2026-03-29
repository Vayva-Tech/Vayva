import { FastifyPluginAsync } from "fastify";
import { SecurityService } from "../../../../services/security/security.service";
import { ApiKeyService } from "../../../../services/security/api-key.service";
import { OpsAuthService } from "../../../../services/security/ops-auth.service";
import { EventBusService } from "../../../../services/security/event-bus.service";

/**
 * Security Routes - Sudo mode, API keys, and ops authentication
 */
export const securityRoutes: FastifyPluginAsync = async (server) => {
  const securityService = new SecurityService(server);
  const apiKeyService = new ApiKeyService();
  const opsAuthService = new OpsAuthService();
  const eventBusService = new EventBusService();

  // ============================================
  // SUDO MODE ROUTES
  // ============================================

  /**
   * GET /api/v1/security/check-sudo
   * Check if user has active sudo mode
   */
  server.get(
    "/check-sudo",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const { storeId } = request.query as { storeId: string };
        const token = extractToken(request.headers.authorization);

        if (!token) {
          return reply.code(401).send({
            success: false,
            error: { code: "UNAUTHORIZED", message: "No token provided" },
          });
        }

        const isSudo = await securityService.checkSudoMode(storeId, token);

        return {
          success: true,
          data: { isSudo },
        };
      } catch (error) {
        server.log.error("[Security Routes] Error checking sudo mode", error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to check sudo mode",
          },
        });
      }
    },
  );

  /**
   * POST /api/v1/security/enable-sudo
   * Enable sudo mode for current session
   */
  server.post(
    "/enable-sudo",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const { storeId, durationMinutes } = request.body as {
          storeId: string;
          durationMinutes?: number;
        };
        const token = extractToken(request.headers.authorization);

        if (!token) {
          return reply.code(401).send({
            success: false,
            error: { code: "UNAUTHORIZED", message: "No token provided" },
          });
        }

        const enabled = await securityService.enableSudoMode(
          storeId,
          token,
          durationMinutes,
        );

        if (!enabled) {
          return reply.code(400).send({
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "Failed to enable sudo mode",
            },
          });
        }

        // Get the updated session to return expiration
        const session = await server.prisma.merchantSession.findUnique({
          where: { token },
          select: { sudoExpiresAt: true },
        });

        return {
          success: true,
          data: {
            enabled: true,
            expiresAt: session?.sudoExpiresAt?.toISOString() || "",
          },
        };
      } catch (error) {
        server.log.error("[Security Routes] Error enabling sudo mode", error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to enable sudo mode",
          },
        });
      }
    },
  );

  // ============================================
  // API KEY MANAGEMENT
  // ============================================

  /**
   * GET /api/v1/security/api-keys
   * Get all API keys for a store
   */
  server.get(
    "/api-keys",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const apiKeys = await apiKeyService.listKeys(storeId);
        return reply.send({ success: true, data: apiKeys });
      } catch (error) {
        server.log.error("[Security Routes] Error getting API keys", error);
        return reply.code(500).send({
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to get API keys" },
        });
      }
    },
  );

  /**
   * POST /api/v1/security/api-keys
   * Create a new API key
   */
  server.post(
    "/api-keys",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const apiKeyData = request.body as any;

        const apiKey = await apiKeyService.createKey(
          storeId,
          apiKeyData.name || "API Key",
          apiKeyData.scopes || [],
          apiKeyData.createdByUserId || "",
        );
        return reply.code(201).send({ success: true, data: apiKey });
      } catch (error) {
        server.log.error("[Security Routes] Error creating API key", error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create API key",
          },
        });
      }
    },
  );

  /**
   * DELETE /api/v1/security/api-keys/:id
   * Delete an API key
   */
  server.delete(
    "/api-keys/:id",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { id } = request.params as { id: string };

        await apiKeyService.revokeKey(id, storeId);
        return reply.send({
          success: true,
          data: { message: "API key deleted successfully" },
        });
      } catch (error) {
        server.log.error("[Security Routes] Error deleting API key", error);
        return reply.code(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to delete API key",
          },
        });
      }
    },
  );

  // ============================================
  // OPS AUTHENTICATION
  // ============================================

  /**
   * POST /api/v1/security/ops/authenticate
   * Authenticate ops user
   */
  server.post("/ops/authenticate", async (request, reply) => {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Email and password required",
          },
        });
      }

      const result = await opsAuthService.login(email, password);
      if (!result.success) {
        return reply.code(401).send({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
        });
      }

      return reply.send({ success: true, data: result.data });
    } catch (error) {
      server.log.error(
        "[Security Routes] Error authenticating ops user",
        error,
      );
      return reply.code(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to authenticate ops user",
        },
      });
    }
  });

  // ============================================
  // EVENT BUS
  // ============================================

  /**
   * GET /api/v1/security/events
   * Get security events
   */
  server.get(
    "/events",
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const events = await eventBusService.getSecurityEvents(storeId);
        return reply.send({ success: true, data: events });
      } catch (error) {
        server.log.error(
          "[Security Routes] Error getting security events",
          error,
        );
        return reply.code(500).send({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get security events",
          },
        });
      }
    },
  );
};

// Helper function to extract token from authorization header
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}
