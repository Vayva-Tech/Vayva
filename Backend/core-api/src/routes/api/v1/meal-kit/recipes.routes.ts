// Backend/core-api/src/routes/api/v1/meal-kit/recipes.routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MealKitRecipeService } from '../../../../services/meal-kit/recipe.service';

export async function mealKitRecipesRoutes(server: FastifyInstance) {
  const recipeService = new MealKitRecipeService();

  // GET /api/v1/meal-kit/recipes - Get all recipes for store
  server.get('/', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          difficulty: { type: 'string' },
          isAvailable: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
      const storeId = (request.user as any).storeId;
      const { category, difficulty, isAvailable } = request.query as any;
      
      const recipes = await recipeService.getStoreRecipes(storeId, {
        category,
        difficulty,
        isAvailable,
      });
      
      return reply.send({ success: true, data: recipes });
    },
  });

  // POST /api/v1/meal-kit/recipes - Create recipe
  server.post('/', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      const storeId = (request.user as any).storeId;
      const recipe = await recipeService.createRecipe(storeId, request.body);
      return reply.status(201).send({ success: true, data: recipe });
    },
  });

  // GET /api/v1/meal-kit/recipes/:id - Get recipe by ID
  server.get('/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const recipe = await recipeService.getRecipeById(request.params.id);
      
      if (!recipe) {
        return reply.status(404).send({ success: false, error: 'Recipe not found' });
      }
      
      return reply.send({ success: true, data: recipe });
    },
  });

  // PUT /api/v1/meal-kit/recipes/:id - Update recipe
  server.put('/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
      const recipe = await recipeService.updateRecipe(request.params.id, request.body);
      return reply.send({ success: true, data: recipe });
    },
  });

  // DELETE /api/v1/meal-kit/recipes/:id - Delete recipe
  server.delete('/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      await recipeService.deleteRecipe(request.params.id);
      return reply.send({ success: true, message: 'Recipe deleted' });
    },
  });
}

export default mealKitRecipesRoutes;
