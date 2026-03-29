import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface MarketplaceVendorsQuery {
  query: {
    storeId?: string;
  };
}

export async function marketplaceVendorsRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<MarketplaceVendorsQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const vendors = await prisma.store.findMany({
        where: {
          industry: 'MARKETPLACE',
          published: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          createdAt: true,
        },
      });

      return reply.send({
        success: true,
        data: vendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          logo: vendor.logo,
          description: vendor.description,
          joinedAt: vendor.createdAt,
        })),
      });
    } catch (error) {
      server.log.error('[MARKETPLACE_VENDORS] Failed to fetch vendors', { error });
      return reply.status(500).send({ error: 'Failed to fetch vendors' });
    }
  });
}
