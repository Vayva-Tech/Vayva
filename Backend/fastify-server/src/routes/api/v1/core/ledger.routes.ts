import { FastifyPluginAsync } from 'fastify';
import { LedgerService } from '../../../../services/core/ledger.service';

const ledgerService = new LedgerService();

export const ledgerRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/ledger/journal-entries - List manual journal entries
  server.get('/journal-entries', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        account: query.account,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
      };

      try {
        const entries = await ledgerService.getJournalEntries(storeId, filters);
        return reply.send({ success: true, data: entries });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch journal entries',
        });
      }
    },
  });

  // POST /api/v1/ledger/journal-entries - Create manual journal entry
  server.post('/journal-entries', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const body = request.body as any;

      try {
        const entry = await ledgerService.createJournalEntry(storeId, userId, body);
        return reply.code(201).send({ success: true, data: entry });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Missing')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create journal entry',
        });
      }
    },
  });
};
