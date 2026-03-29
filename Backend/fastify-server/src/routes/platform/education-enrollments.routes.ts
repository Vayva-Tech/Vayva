import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface EnrollmentsQuery {
  query: {
    storeId?: string;
  };
}

export async function educationEnrollmentsRoutes(server: FastifyInstance) {
  server.get('/', async (request: FastifyRequest<EnrollmentsQuery>, reply: FastifyReply) => {
    try {
      const { storeId } = request.query;
      
      if (!storeId) {
        return reply.status(400).send({ error: 'storeId is required' });
      }

      const enrollments = await prisma.orderItem.findMany({
        where: {
          order: {
            storeId,
            status: { in: ['PAID', 'COMPLETED'] },
          },
          productVariant: {
            product: {
              productType: 'course',
            },
          },
        },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          productVariant: {
            include: {
              product: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

      return reply.send({
        success: true,
        data: enrollments.map((enrollment) => ({
          id: enrollment.id,
          orderId: enrollment.orderId,
          courseName: enrollment.productVariant?.product?.title,
          variantName: enrollment.productVariant?.title,
          studentName: `${enrollment.order?.customer?.firstName} ${enrollment.order?.customer?.lastName}`,
          studentEmail: enrollment.order?.customer?.email,
          enrolledAt: enrollment.order?.createdAt,
          status: enrollment.order?.status,
        })),
      });
    } catch (error) {
      server.log.error('[EDUCATION_ENROLLMENTS] Failed to fetch enrollments', { error });
      return reply.status(500).send({ error: 'Failed to fetch enrollments' });
    }
  });
}
