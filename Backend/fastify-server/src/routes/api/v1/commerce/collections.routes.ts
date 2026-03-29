import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CollectionService } from "../../../../services/commerce/collection.service";

const service = new CollectionService();

export const collectionRoutes: FastifyPluginAsync = async (
  server: FastifyInstance,
) => {
  // GET /api/v1/commerce/collections
  server.get("/", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const collections = await service.findAll(storeId);
        return reply.send({ success: true, data: collections });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch collections",
        });
      }
    },
  });

  // POST /api/v1/commerce/collections
  server.post("/", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const collection = await service.create(storeId, data);
        return reply.code(201).send({ success: true, data: collection });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create collection",
        });
      }
    },
  });

  // PUT /api/v1/commerce/collections/:id
  server.put("/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const collection = await service.update(id, storeId, data);
        return reply.send({ success: true, data: collection });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update collection",
        });
      }
    },
  });

  // DELETE /api/v1/commerce/collections/:id
  server.delete("/:id", {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await service.delete(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete collection",
        });
      }
    },
  });
};
