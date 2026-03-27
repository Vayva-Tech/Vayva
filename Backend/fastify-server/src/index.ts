import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import pino from 'pino';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes - Core Commerce Services
import { authRoutes } from './routes/api/v1/auth/auth.routes';
import { inventoryRoutes } from './routes/api/v1/inventory/inventory.routes';
import { ordersRoutes } from './routes/api/v1/core/orders.routes';
import { productsRoutes } from './routes/api/v1/core/products.routes';
import { customersRoutes } from './routes/api/v1/core/customers.routes';

// Import routes - Commerce & Checkout
import { cartRoutes } from './routes/api/v1/commerce/cart.routes';
import { checkoutRoutes } from './routes/api/v1/commerce/checkout.routes';
import { collectionRoutes } from './routes/api/v1/commerce/collections.routes';
import { couponRoutes } from './routes/api/v1/commerce/coupons.routes';
import { discountRulesRoutes } from './routes/api/v1/commerce/discount-rules.routes';
import { reviewRoutes } from './routes/api/v1/commerce/reviews.routes';
import { servicesRoutes } from './routes/api/v1/commerce/services.routes';

// Import routes - Financial Services
import { paymentsRoutes } from './routes/api/v1/financial/payments.routes';
import { walletRoutes } from './routes/api/v1/financial/wallet.routes';
import { paymentMethodsRoutes } from './routes/api/v1/financial/payment-methods.routes';

// Import routes - Industry Services
import { posRoutes } from './routes/api/v1/pos/pos.routes';
import { rentalRoutes } from './routes/api/v1/rentals/rental.routes';
import { mealKitRecipesRoutes } from './routes/api/v1/meal-kit/recipes.routes';
import { fashionQuizRoutes } from './routes/api/v1/fashion/style-quiz.routes';
import { educationCoursesRoutes } from './routes/api/v1/education/courses.routes';
import { restaurantRoutes } from './routes/api/v1/industry/restaurant.routes';
import { groceryRoutes } from './routes/api/v1/industry/grocery.routes';
import { healthcareRoutes } from './routes/api/v1/industry/healthcare.routes';
import { beautyRoutes } from './routes/api/v1/industry/beauty.routes';
import { eventsRoutes } from './routes/api/v1/industry/events.routes';
import { nightlifeRoutes } from './routes/api/v1/industry/nightlife.routes';
import { retailRoutes } from './routes/api/v1/industry/retail.routes';
import { wholesaleRoutes } from './routes/api/v1/industry/wholesale.routes';
import { quoteRoutes } from './routes/api/v1/industry/quotes.routes';
import { portfolioRoutes } from './routes/api/v1/industry/portfolio.routes';
import { propertiesRoutes } from './routes/api/v1/industry/properties.routes';
import { vehicleRoutes } from './routes/api/v1/industry/vehicles.routes';
import { travelRoutes } from './routes/api/v1/industry/travel.routes';
import { wellnessRoutes } from './routes/api/v1/industry/wellness.routes';
import { professionalServicesRoutes } from './routes/api/v1/industry/professional-services.routes';

// Import routes - Platform Services
import { campaignsRoutes } from './routes/api/v1/platform/campaigns.routes';
import { creativeRoutes } from './routes/api/v1/platform/creative.routes';
import { nonprofitRoutes } from './routes/api/v1/platform/nonprofit.routes';
import { dashboardRoutes } from './routes/api/v1/platform/dashboard.routes';
import { analyticsRoutes } from './routes/api/v1/platform/analytics.routes';
import { notificationsRoutes } from './routes/api/v1/platform/notifications.routes';
import { marketingRoutes } from './routes/api/v1/platform/marketing.routes';
import { integrationsRoutes } from './routes/api/v1/platform/integrations.routes';
import { complianceRoutes } from './routes/api/v1/platform/compliance.routes';
import { domainsRoutes } from './routes/api/v1/platform/domains.routes';
import { blogRoutes } from './routes/api/v1/platform/blog.routes';
import { sitesRoutes } from './routes/api/v1/platform/sites.routes';
import { storageRoutes } from './routes/api/v1/platform/storage.routes';
import { supportRoutes } from './routes/api/v1/platform/support.routes';
import { socialsRoutes } from './routes/api/v1/platform/socials.routes';
import { websocketRoutes } from './routes/api/v1/platform/websocket.routes';
import { webstudioRoutes } from './routes/api/v1/platform/webstudio.routes';
import { creditRoutes } from './routes/api/v1/platform/credits.routes';
import { templatesRoutes } from './routes/api/v1/platform/templates.routes';
import { referralsRoutes } from './routes/api/v1/platform/referrals.routes';
import { rescueRoutes } from './routes/api/v1/platform/rescue.routes';
import { healthScoreRoutes } from './routes/api/v1/platform/health-score.routes';
import { npsRoutes } from './routes/api/v1/platform/nps.routes';
import { playbooksRoutes } from './routes/api/v1/platform/playbooks.routes';

// Import routes - Core Services
import { accountRoutes } from './routes/api/v1/core/account.routes';
import { billingRoutes } from './routes/api/v1/core/billing.routes';
import { settingsRoutes } from './routes/api/v1/core/settings.routes';
import { subscriptionsRoutes } from './routes/api/v1/core/subscriptions.routes';
import { bookingsRoutes } from './routes/api/v1/core/bookings.routes';
import { fulfillmentRoutes } from './routes/api/v1/core/fulfillment.routes';
import { invoicesRoutes } from './routes/api/v1/core/invoices.routes';
import { ledgerRoutes } from './routes/api/v1/core/ledger.routes';
import { refundsRoutes } from './routes/api/v1/core/refunds.routes';
import { returnsRoutes } from './routes/api/v1/core/returns.routes';
import { settlementsRoutes } from './routes/api/v1/core/settlements.routes';
import { workflowsRoutes } from './routes/api/v1/core/workflows.routes';

// Import routes - Marketing
import { leadsRoutes } from './routes/api/v1/marketing/leads.routes';

// Import routes - Admin Services
import { merchantAdminRoutes } from './routes/api/v1/admin/merchants.routes';
import { adminSystemRoutes } from './routes/api/v1/admin/admin-system.routes';

// Import routes - AI & Intelligent Services
import { aiRoutes } from './routes/api/v1/ai/ai.routes';
import { aiAgentRoutes } from './routes/api/v1/ai/aiAgent.routes';
import { automationRoutes } from './routes/api/v1/ai/automation.routes';
import { aiOpsRoutes } from './routes/api/v1/ai/ai-ops.routes';

// Import routes - Platform Services (Risk)
import { riskRoutes } from './routes/api/v1/platform/risk.routes';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger,
  });

  // Register CORS
  await server.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Register JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-min-32-characters',
  });

  // Add authentication decorator
  server.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Register routes - Core Commerce Services
  await server.register(authRoutes, { prefix: '/api/v1/auth' });
  await server.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
  await server.register(ordersRoutes, { prefix: '/api/v1/orders' });
  await server.register(productsRoutes, { prefix: '/api/v1/products' });
  await server.register(customersRoutes, { prefix: '/api/v1/customers' });

  // Register routes - Commerce & Checkout
  await server.register(cartRoutes, { prefix: '/api/v1/carts' });
  await server.register(checkoutRoutes, { prefix: '/api/v1/checkouts' });
  await server.register(collectionRoutes, { prefix: '/api/v1/collections' });
  await server.register(couponRoutes, { prefix: '/api/v1/coupons' });
  await server.register(discountRulesRoutes, { prefix: '/api/v1/discount-rules' });
  await server.register(reviewRoutes, { prefix: '/api/v1/reviews' });
  await server.register(servicesRoutes, { prefix: '/api/v1/services' });

  // Register routes - Financial Services
  await server.register(paymentsRoutes, { prefix: '/api/v1/payments' });
  await server.register(walletRoutes, { prefix: '/api/v1/wallet' });
  await server.register(paymentMethodsRoutes, { prefix: '/api/v1/payment-methods' });

  // Register routes - Industry Services
  await server.register(posRoutes, { prefix: '/api/v1/pos' });
  await server.register(rentalRoutes, { prefix: '/api/v1/rentals' });
  await server.register(mealKitRecipesRoutes, { prefix: '/api/v1/meal-kit/recipes' });
  await server.register(fashionQuizRoutes, { prefix: '/api/v1/fashion/quizzes' });
  await server.register(educationCoursesRoutes, { prefix: '/api/v1/education/courses' });
  await server.register(restaurantRoutes, { prefix: '/api/v1/restaurant' });
  await server.register(groceryRoutes, { prefix: '/api/v1/grocery' });
  await server.register(healthcareRoutes, { prefix: '/api/v1/healthcare' });
  await server.register(beautyRoutes, { prefix: '/api/v1/beauty' });
  await server.register(eventsRoutes, { prefix: '/api/v1/events' });
  await server.register(nightlifeRoutes, { prefix: '/api/v1/nightlife' });
  await server.register(retailRoutes, { prefix: '/api/v1/retail' });
  await server.register(wholesaleRoutes, { prefix: '/api/v1/wholesale' });
  await server.register(quoteRoutes, { prefix: '/api/v1/quotes' });
  await server.register(portfolioRoutes, { prefix: '/api/v1/portfolio' });
  await server.register(propertiesRoutes, { prefix: '/api/v1/properties' });
  await server.register(vehicleRoutes, { prefix: '/api/v1/vehicles' });
  await server.register(travelRoutes, { prefix: '/api/v1/travel' });
  await server.register(wellnessRoutes, { prefix: '/api/v1/wellness' });
  await server.register(professionalServicesRoutes, { prefix: '/api/v1/professional-services' });

  // Register routes - Platform Services
  await server.register(campaignsRoutes, { prefix: '/api/v1/campaigns' });
  await server.register(creativeRoutes, { prefix: '/api/v1/creative' });
  await server.register(nonprofitRoutes, { prefix: '/api/v1/nonprofit' });
  await server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  await server.register(analyticsRoutes, { prefix: '/api/v1/analytics' });
  await server.register(notificationsRoutes, { prefix: '/api/v1/notifications' });
  await server.register(marketingRoutes, { prefix: '/api/v1/marketing' });
  await server.register(integrationsRoutes, { prefix: '/api/v1/integrations' });
  await server.register(complianceRoutes, { prefix: '/api/v1/compliance' });
  await server.register(domainsRoutes, { prefix: '/api/v1/domains' });
  await server.register(blogRoutes, { prefix: '/api/v1/blog' });
  await server.register(sitesRoutes, { prefix: '/api/v1/sites' });
  await server.register(storageRoutes, { prefix: '/api/v1/storage' });
  await server.register(supportRoutes, { prefix: '/api/v1/support' });
  await server.register(socialsRoutes, { prefix: '/api/v1/socials' });
  await server.register(websocketRoutes, { prefix: '/api/v1/websocket' });
  await server.register(webstudioRoutes, { prefix: '/api/v1/webstudio' });
  await server.register(creditRoutes, { prefix: '/api/v1/credits' });
  await server.register(templatesRoutes, { prefix: '/api/v1/templates' });
  await server.register(referralsRoutes, { prefix: '/api/v1/referrals' });
  await server.register(rescueRoutes, { prefix: '/api/v1/rescue' });
  
  // Register Admin Services
  await server.register(merchantAdminRoutes, { prefix: '/api/v1/admin/merchants' });
  await server.register(adminSystemRoutes, { prefix: '/api/v1/admin' });
  
  // Register AI Ops Routes
  await server.register(aiOpsRoutes, { prefix: '/api/v1/ai' });
  
  // Register Risk Routes
  await server.register(riskRoutes, { prefix: '/api/v1/compliance' });
  
  await server.register(healthScoreRoutes, { prefix: '/api/v1/health-score' });
  await server.register(npsRoutes, { prefix: '/api/v1/nps' });
  await server.register(playbooksRoutes, { prefix: '/api/v1/playbooks' });

  // Register routes - Core Services
  await server.register(accountRoutes, { prefix: '/api/v1/account' });
  await server.register(billingRoutes, { prefix: '/api/v1/billing' });
  await server.register(settingsRoutes, { prefix: '/api/v1/settings' });
  await server.register(subscriptionsRoutes, { prefix: '/api/v1/subscriptions' });

  // Register routes - Marketing
  await server.register(leadsRoutes, { prefix: '/api/v1/leads' });

  // Register routes - Branch 1: Critical Business Operations
  await server.register(bookingsRoutes, { prefix: '/api/v1/bookings' });
  await server.register(fulfillmentRoutes, { prefix: '/api/v1/fulfillment' });
  await server.register(invoicesRoutes, { prefix: '/api/v1/invoices' });
  await server.register(ledgerRoutes, { prefix: '/api/v1/ledger' });
  await server.register(refundsRoutes, { prefix: '/api/v1/refunds' });
  await server.register(returnsRoutes, { prefix: '/api/v1/returns' });
  await server.register(settlementsRoutes, { prefix: '/api/v1/settlements' });
  await server.register(workflowsRoutes, { prefix: '/api/v1/workflows' });

  // Register routes - AI & Intelligent Services
  await server.register(aiRoutes, { prefix: '/api/v1/ai' });
  await server.register(aiAgentRoutes, { prefix: '/api/v1/ai-agent' });
  await server.register(automationRoutes, { prefix: '/api/v1/automation' });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
}
