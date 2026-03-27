import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config/fastify';
import { logger } from './lib/logger';

export const buildServer = async () => {
  const server = Fastify({
    logger: {
      level: config.logLevel,
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
    },
  });

  // Register CORS plugin
  await server.register(cors, {
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-store-id', 'x-user-id', 'x-request-id'],
  });

  // Register JWT plugin
  await server.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: '7d',
    },
  });

  // Add authentication decorator
  server.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Register routes
  await server.register(require('./routes/health.routes'));
  await server.register(require('./routes/api.v1.routes'), { prefix: '/api/v1' });

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info({ signal }, 'Shutting down server');
      await server.close();
      process.exit(0);
    });
  });

  return server;
};
