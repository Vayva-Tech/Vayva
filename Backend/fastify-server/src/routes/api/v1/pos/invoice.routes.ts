import { FastifyPluginAsync } from "fastify";
import {
  invoiceGenerator,
  paymentVerifier,
  transactionTracker,
} from "../../../../services/pos/invoice-generator.service";

const invoiceRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/pos/invoices/generate
   * Generate invoice for POS order
   */
  server.post("/generate", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const {
        orderId,
        includeQRCode = true,
        format = "PDF",
      } = request.body as any;

      try {
        const result = await invoiceGenerator.generateInvoice(orderId, {
          includeQRCode,
          format: format as "PDF" | "HTML" | "EMAIL",
        });

        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate invoice",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/invoices/email
   * Email invoice to customer
   */
  server.post("/email", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId, customerEmail } = request.body as {
        orderId: string;
        customerEmail: string;
      };

      try {
        const result = await invoiceGenerator.emailInvoice(
          orderId,
          customerEmail,
        );
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to email invoice",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/invoices/:orderId
   * Get invoice data
   */
  server.get<{ Params: { orderId: string } }>("/:orderId", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId } = request.params;

      try {
        const result = await invoiceGenerator.generateInvoice(orderId);
        return reply.send(result);
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : "Invoice not found",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/payments/verify
   * Verify Paystack payment
   */
  server.post("/payments/verify", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { reference, amount, email } = request.body as {
        reference: string;
        amount: number;
        email: string;
      };

      try {
        // Verify with Paystack
        const verification = await paymentVerifier.verifyPaystackPayment(
          reference,
          amount,
        );

        if (!verification.verified) {
          return reply.code(400).send({
            success: false,
            error: verification.error,
          });
        }

        return reply.send({
          success: true,
          data: verification.data,
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : "Verification failed",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/payments/record-verified
   * Record verified payment in order
   */
  server.post("/payments/record-verified", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId, ...paymentData } = request.body as any;

      try {
        const result = await paymentVerifier.recordVerifiedPayment(
          orderId,
          paymentData,
        );
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to record payment",
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/transactions/track
   * Track transaction event
   */
  server.post("/transactions/track", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string; userId: string };
      const { orderId, eventType, metadata } = request.body as any;

      try {
        const result = await transactionTracker.trackTransactionEvent({
          orderId,
          eventType,
          metadata,
          actorId: user.userId,
          actorType: "CASHIER",
        });
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Tracking failed",
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/transactions/:orderId/history
   * Get transaction history
   */
  server.get<{ Params: { orderId: string } }>("/:orderId/history", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { orderId } = request.params;

      try {
        const result = await transactionTracker.getTransactionHistory(orderId);
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch history",
        });
      }
    },
  });
};

export default invoiceRoutes;
