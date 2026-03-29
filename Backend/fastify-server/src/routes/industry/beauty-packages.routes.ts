import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface PackagesQuery {
  query: {
    storeId?: string;
  };
}

export async function beautyPackagesRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<PackagesQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const packages = await prisma.serviceBundle.findMany({
        where: {
          storeId,
        },
        include: {
          services: {
            include: {
              service: {
                select: {
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      return reply.send({
        success: true,
        data: packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: Number(pkg.price),
          services: pkg.services.map((s) => ({
            id: s.service.id,
            name: s.service.title,
            price: Number(s.service.price),
          })),
        })),
      });
    } catch (error) {
      server.log.error('[BEAUTY_PACKAGES] Failed to fetch packages', { error });
      return reply.status(500).send({ error: 'Failed to fetch packages' });
    }
  });
}
