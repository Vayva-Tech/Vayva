import { FastifyPluginAsync } from 'fastify';
import { HealthCheckService } from '../../services/platform/health-check.service';
import { prisma } from '@vayva/db';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const healthCheckService = new HealthCheckService();

  // Kubernetes-style health check (basic liveness probe)
  fastify.get('/health', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'ok',
        },
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Kubernetes readiness probe
  fastify.get('/ready', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ready' });
    } catch (error) {
      return reply.code(503).send({ status: 'not ready' });
    }
  });

  // Comprehensive health check with detailed diagnostics
  fastify.get('/comprehensive', async (request, reply) => {
    try {
      const result = await healthCheckService.comprehensive();
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
