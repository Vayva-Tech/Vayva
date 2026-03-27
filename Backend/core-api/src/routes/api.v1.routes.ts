import { FastifyInstance } from 'fastify';

export async function apiV1Routes(server: FastifyInstance) {
  // Register auth routes
  await server.register(require('./api/v1/auth/auth.routes'));

  // Register industry-specific routes
  await server.register(require('./api/v1/meal-kit/recipes.routes'), { prefix: '/meal-kit/recipes' });
  await server.register(require('./api/v1/fashion/style-quiz.routes'), { prefix: '/fashion/quizzes' });
  await server.register(require('./api/v1/education/courses.routes'), { prefix: '/education/courses' });

  // Register inventory routes
  await server.register(require('./api/v1/inventory/inventory.routes'), { prefix: '/inventory' });

  // Register POS routes
  await server.register(require('./api/v1/pos/pos.routes'), { prefix: '/pos' });

  // Register rental routes
  await server.register(require('./api/v1/rentals/rental.routes'), { prefix: '/rentals' });

  // TODO: Register other core route groups as they are implemented
  // await server.register(require('./api/v1/store/store.routes'));
  // await server.register(require('./api/v1/dashboard/dashboard.routes'));
  // await server.register(require('./api/v1/products/products.routes'));
  // await server.register(require('./api/v1/orders/orders.routes'));
  // await server.register(require('./api/v1/customers/customers.routes'));
}

export default apiV1Routes;
