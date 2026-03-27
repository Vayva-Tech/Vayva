import { FastifyPluginAsync } from 'fastify';
import { InvoiceService } from '../../../services/core/invoice.service';

const invoiceService = new InvoiceService();

export const invoicesRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/invoices - List invoices with filters
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        subscriptionId: query.subscriptionId,
        startDate: query.startDate,
        endDate: query.endDate,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      try {
        const result = await invoiceService.getInvoices(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        });
      }
    },
  });

  // POST /api/v1/invoices - Create new invoice
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const body = request.body as any;

      try {
        const invoice = await invoiceService.createInvoice(storeId, body);
        return reply.code(201).send({ success: true, invoice });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('Amount')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create invoice',
        });
      }
    },
  });

  // PATCH /api/v1/invoices - Update invoice status
  server.patch('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id, action } = request.body as any;

      if (!id || !action) {
        return reply.code(400).send({
          success: false,
          error: 'Invoice ID and action are required',
        });
      }

      try {
        const invoice = await invoiceService.updateInvoiceStatus(
          storeId,
          id,
          action,
          request.body
        );
        return reply.send({ success: true, invoice });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (
          error instanceof Error &&
          (error.message.includes('already') ||
            error.message.includes('Cannot') ||
            error.message.includes('Can only'))
        ) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update invoice',
        });
      }
    },
  });
};
