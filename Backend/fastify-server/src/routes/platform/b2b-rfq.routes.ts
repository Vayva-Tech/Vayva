import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface B2BRFQQuery {
  query: {
    storeId?: string;
  };
}

export async function b2bRfqRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<B2BRFQQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const rfqs = await prisma.rfq.findMany({
        where: { storeId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        data: rfqs.map((rfq) => ({
          id: rfq.id,
          customerName: `${rfq.customer?.firstName} ${rfq.customer?.lastName}`,
          customerEmail: rfq.customer?.email,
          items: rfq.items || [],
          totalValue: Number(rfq.estimatedValue || 0),
          status: rfq.status,
          createdAt: rfq.createdAt,
        })),
      });
    } catch (error) {
      server.log.error('[B2B_RFQ] Failed to fetch RFQs', { error });
      return reply.status(500).send({ error: 'Failed to fetch RFQs' });
    }
  });
}
