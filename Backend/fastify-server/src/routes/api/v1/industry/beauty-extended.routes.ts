/**
 * Beauty Industry Extended Routes
 * 
 * POST   /api/v1/beauty/skin-profile - Create skin profile
 * GET    /api/v1/beauty/skin-profile - Get skin profile
 * PUT    /api/v1/beauty/skin-profile - Update skin profile
 * GET    /api/v1/beauty/product-shades - Get product shades
 * POST   /api/v1/beauty/product-shades - Create product shade
 * GET    /api/v1/beauty/routines - Get routines
 * POST   /api/v1/beauty/routines - Create routine
 * GET    /api/v1/beauty/recommended-routines - Get recommended routines
 * POST   /api/v1/beauty/match-shade - Match shade to customer
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { BeautyExtendedService } from '../../../../services/industry/beauty-extended.service';

const CreateSkinProfileSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  skinType: z.string(),
  skinTone: z.string().optional(),
  undertone: z.string().optional(),
  concerns: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

const UpdateSkinProfileSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  skinType: z.string().optional(),
  skinTone: z.string().optional(),
  undertone: z.string().optional(),
  concerns: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

const CreateProductShadeSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  shadeName: z.string(),
  hexColor: z.string().optional(),
  skinToneMatch: z.array(z.string()).optional(),
  undertoneMatch: z.string().optional(),
  imageUrl: z.string().optional(),
});

const CreateRoutineSchema = z.object({
  name: z.string(),
  targetSkinType: z.array(z.string()),
  targetConcerns: z.array(z.string()),
  steps: z.any(),
});

const MatchShadeSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  customerId: z.string().uuid('Invalid customer ID'),
});

export async function beautyExtendedRoutes(server: FastifyInstance) {
  const service = new BeautyExtendedService();

  /**
   * POST /api/v1/beauty/skin-profile
   * Create skin profile for a customer
   */
  server.post('/skin-profile', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['customerId', 'skinType'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
          skinType: { type: 'string' },
          skinTone: { type: 'string' },
          undertone: { type: 'string' },
          concerns: { type: 'array', items: { type: 'string' } },
          allergies: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = CreateSkinProfileSchema.parse(request.body as any);
        const user = (request.user as any);

        // Verify user has store access
        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const profile = await service.createSkinProfile(user.storeId, body);

        return reply.code(201).send({
          success: true,
          data: profile,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Create skin profile failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }

        if (error.message === 'Customer not found') {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to create skin profile',
        });
      }
    },
  });

  /**
   * GET /api/v1/beauty/skin-profile
   * Get skin profile for a customer
   */
  server.get('/skin-profile', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['customerId'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = (request.query as any);
        const user = (request.user as any);

        // Verify user has store access
        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const profile = await service.getSkinProfile(user.storeId, query.customerId);

        if (!profile) {
          return reply.code(404).send({
            success: false,
            error: 'Skin profile not found',
          });
        }

        return reply.code(200).send({
          success: true,
          data: profile,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Get skin profile failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get skin profile',
        });
      }
    },
  });

  /**
   * PUT /api/v1/beauty/skin-profile
   * Update skin profile
   */
  server.put('/skin-profile', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['customerId'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
          skinType: { type: 'string' },
          skinTone: { type: 'string' },
          undertone: { type: 'string' },
          concerns: { type: 'array', items: { type: 'string' } },
          allergies: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = UpdateSkinProfileSchema.parse(request.body as any);
        const user = (request.user as any);

        // Verify user has store access
        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const profile = await service.updateSkinProfile(user.storeId, body.customerId, body);

        return reply.code(200).send({
          success: true,
          data: profile,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Update skin profile failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
          });
        }

        if (error.message === 'Customer not found') {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to update skin profile',
        });
      }
    },
  });

  /**
   * GET /api/v1/beauty/product-shades
   * Get product shades
   */
  server.get('/product-shades', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = (request.query as any);
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const shades = await service.getProductShades(query.productId);

        return reply.code(200).send({
          success: true,
          data: shades,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Get product shades failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get product shades',
        });
      }
    },
  });

  /**
   * POST /api/v1/beauty/product-shades
   * Create product shade
   */
  server.post('/product-shades', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['productId', 'shadeName'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
          shadeName: { type: 'string' },
          hexColor: { type: 'string' },
          skinToneMatch: { type: 'array', items: { type: 'string' } },
          undertoneMatch: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = CreateProductShadeSchema.parse(request.body as any);
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const shade = await service.createProductShade(body);

        return reply.code(201).send({
          success: true,
          data: shade,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Create product shade failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to create product shade',
        });
      }
    },
  });

  /**
   * GET /api/v1/beauty/routines
   * Get routines by store
   */
  server.get('/routines', {
    preHandler: [server.authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const routines = await service.getRoutinesByStore(user.storeId);

        return reply.code(200).send({
          success: true,
          data: routines,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Get routines failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get routines',
        });
      }
    },
  });

  /**
   * POST /api/v1/beauty/routines
   * Create routine
   */
  server.post('/routines', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'targetSkinType', 'targetConcerns', 'steps'],
        properties: {
          name: { type: 'string' },
          targetSkinType: { type: 'array', items: { type: 'string' } },
          targetConcerns: { type: 'array', items: { type: 'string' } },
          steps: { type: 'object' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = CreateRoutineSchema.parse(request.body as any);
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const routine = await service.createRoutine(user.storeId, body);

        return reply.code(201).send({
          success: true,
          data: routine,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Create routine failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to create routine',
        });
      }
    },
  });

  /**
   * GET /api/v1/beauty/recommended-routines
   * Get recommended routines for a customer
   */
  server.get('/recommended-routines', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['customerId'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = (request.query as any);
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const routines = await service.getRecommendedRoutines(user.storeId, query.customerId);

        return reply.code(200).send({
          success: true,
          data: routines,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Get recommended routines failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get recommended routines',
        });
      }
    },
  });

  /**
   * POST /api/v1/beauty/match-shade
   * Match product shade to customer's skin profile
   */
  server.post('/match-shade', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['productId', 'customerId'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = MatchShadeSchema.parse(request.body as any);
        const user = (request.user as any);

        const hasPermission = await server.hasStoreAccess(user.id, user.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ success: false, error: 'Unauthorized' });
        }

        const match = await service.matchShade(user.storeId, body.productId, body.customerId);

        if (!match) {
          return reply.code(404).send({
            success: false,
            error: 'No matching shade found',
          });
        }

        return reply.code(200).send({
          success: true,
          data: match,
        });
      } catch (error: any) {
        server.log.error(error, '[BeautyExtended] Match shade failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to match shade',
        });
      }
    },
  });

  server.log.info('✅ Beauty extended routes registered');
}
