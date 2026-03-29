import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface GalleryQuery {
  query: {
    storeId?: string;
  };
}

export async function beautyGalleryRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<GalleryQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const gallery = await prisma.productImage.findMany({
        where: {
          product: {
            storeId,
          },
        },
        include: {
          product: {
            select: {
              title: true,
              productType: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      });

      return reply.send({
        success: true,
        data: gallery.map((img) => ({
          id: img.id,
          url: img.url,
          productId: img.productId,
          productName: img.product?.title,
          productType: img.product?.productType,
          position: img.position,
        })),
      });
    } catch (error) {
      server.log.error('[BEAUTY_GALLERY] Failed to fetch gallery', { error });
      return reply.status(500).send({ error: 'Failed to fetch gallery' });
    }
  });
}
