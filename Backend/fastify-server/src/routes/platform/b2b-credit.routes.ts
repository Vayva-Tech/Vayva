  import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface B2BCreditQuery {
  query: {
    storeId?: string;
  };
}

export async function b2bCreditApplicationsRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<B2BCreditQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const applications = await prisma.creditApplication.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        data: applications.map((app) => ({
          id: app.id,
          amount: Number(app.requestedAmount),
          status: app.status,
          purpose: app.purpose,
          submittedAt: app.createdAt,
        })),
      });
    } catch (error) {
      server.log.error('[B2B_CREDIT_APPLICATIONS] Failed to fetch applications', { error });
      return reply.status(500).send({ error: 'Failed to fetch credit applications' });
    }
  });
}
