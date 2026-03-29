import { FastifyPluginAsync } from 'fastify';
import { WebhookService } from '../../services/platform/webhook.service';

export const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  const webhookService = new WebhookService();

  fastify.get('/', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await webhookService.getWebhooks(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.post('/delivery/kwik', async (request, reply) => {
    try {
      const secret = process.env.KWIK_WEBHOOK_SECRET;
      const signature = request.headers['x-kwik-signature'] as string | undefined;
      
      if (!secret || !signature) {
        return reply.code(401).send({ success: false, error: 'Unauthorized' });
      }

      // Validate signature using crypto
      const crypto = require('crypto');
      const sigBuf = Buffer.from(signature, 'utf8');
      const secretBuf = Buffer.from(secret, 'utf8');
      
      if (sigBuf.length !== secretBuf.length) {
        return reply.code(403).send({ success: false, error: 'Invalid Signature' });
      }
      
      if (!crypto.timingSafeEqual(sigBuf, secretBuf)) {
        return reply.code(403).send({ success: false, error: 'Invalid Signature' });
      }

      const body = request.body as Record<string, unknown>;
      const job_id = body.job_id;
      const job_status = body.job_status;
      const status = body.status;
      const kwikStatus = job_status ?? status;

      if (job_id == null) {
        return reply.code(400).send({ success: false, error: 'job_id required' });
      }

      const jobId = String(job_id);
      const result = await webhookService.handleKwikWebhook(jobId, Number(kwikStatus));
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error && error.message === 'Shipment Not Found') {
        return reply.code(404).send({ success: false, error: error.message });
      }
      throw error;
    }
  });
};
