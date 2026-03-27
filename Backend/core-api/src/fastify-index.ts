// Fastify server entry point
import { buildServer } from './server-fastify';
import { config } from './config/fastify';
import { logger } from './lib/logger';

const start = async () => {
  try {
    const server = await buildServer();
    
    await server.listen({
      port: config.port,
      host: config.host,
    });
    
    logger.info({ port: config.port, host: config.host }, '🚀 Fastify server started');
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
};

start();
