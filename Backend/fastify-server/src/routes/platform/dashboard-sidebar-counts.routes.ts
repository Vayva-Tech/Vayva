import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface SidebarCountsQuery {
  query: {
    storeId?: string;
  };
}

export async function dashboardSidebarCountsRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<SidebarCountsQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const [orderCount, productCount, customerCount, bookingCount] = await Promise.all([
        prisma.order.count({
          where: { storeId },
        }),
        prisma.product.count({
          where: { storeId },
        }),
        prisma.customer.count({
          where: { storeId },
        }),
        prisma.booking.count({
          where: { storeId },
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          orders: orderCount,
          products: productCount,
          customers: customerCount,
          bookings: bookingCount,
        },
      });
    } catch (error) {
      server.log.error('[DASHBOARD_SIDEBAR_COUNTS] Failed to fetch counts', { error });
      return reply.status(500).send({ error: 'Failed to fetch sidebar counts' });
    }
  });
}
