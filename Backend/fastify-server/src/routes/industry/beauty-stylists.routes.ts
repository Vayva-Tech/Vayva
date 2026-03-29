import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface StylistQuery {
  query: {
    storeId?: string;
  };
}

export async function beautyStylistsRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<StylistQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const stylists = await prisma.user.findMany({
        where: {
          memberships: {
            some: {
              storeId,
              status: 'ACTIVE',
            },
          },
        },
        include: {
          memberships: {
            where: {
              storeId,
              status: 'ACTIVE',
            },
            select: {
              role: true,
              permissions: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        data: stylists.map((stylist) => ({
          id: stylist.id,
          name: `${stylist.firstName} ${stylist.lastName}`,
          email: stylist.email,
          phone: stylist.phone,
          role: stylist.memberships[0]?.role || 'STYLIST',
          permissions: stylist.memberships[0]?.permissions || [],
        })),
      });
    } catch (error) {
      server.log.error('[BEAUTY_STYLISTS] Failed to fetch stylists', { error });
      return reply.status(500).send({ error: 'Failed to fetch stylists' });
    }
  });
}
