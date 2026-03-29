import { FastifyPluginAsync } from 'fastify';
import { DashboardService } from '../../../../services/platform/dashboard.service';
import { TaskService } from '../../../../services/platform/task.service';
import { AlertService } from '../../../../services/platform/alert.service';
import { InsightService } from '../../../../services/platform/insight.service';

const dashboardService = new DashboardService();
const taskService = new TaskService();
const alertService = new AlertService();
const insightService = new InsightService();

export const unifiedDashboardRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/dashboard/unified
   * 
   * Unified dashboard data endpoint for the new modular dashboard system
   * Returns aggregated data for all dashboard modules in a single request
   * 
   * Query Parameters:
   * - industry: Industry slug (restaurant, beauty-wellness, healthcare, retail, etc.)
   * - planTier: Subscription tier (STARTER, PRO, PRO_PLUS)
   * - range: Time range (today, week, month, year)
   */
  server.get('/unified', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
          planTier: { type: 'string', enum: ['STARTER', 'PRO', 'PRO_PLUS'] },
          range: { type: 'string', enum: ['today', 'week', 'month', 'year'], default: 'month' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as {
          industry?: string;
          planTier?: 'STARTER' | 'PRO' | 'PRO_PLUS';
          range?: 'today' | 'week' | 'month' | 'year';
        };
        
        const industry = query.industry || 'retail'; // Default fallback
        const planTier = query.planTier || 'STARTER';
        const range = query.range || 'month';
        
        // Fetch all data in parallel for optimal performance
        const [metrics, tasks, alerts, insights] = await Promise.all([
          dashboardService.getMetrics(storeId, { industry, planTier, range }),
          taskService.getTasks(storeId, { industry, limit: 5 }),
          alertService.getAlerts(storeId, { industry, limit: 5 }),
          insightService.getInsights(storeId, { industry, planTier, range }),
        ]);
        
        return reply.send({
          success: true,
          data: {
            metrics,
            tasks,
            alerts,
            insights,
            metadata: {
              industry,
              planTier,
              range,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'UNIFIED_DASHBOARD_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch unified dashboard data',
          },
        });
      }
    },
  });

  /**
   * GET /api/v1/dashboard/module/:moduleId
   * 
   * Fetch individual dashboard module data
   * Useful for lazy loading or refreshing specific modules
   */
  server.get<{ Params: { moduleId: string }; Querystring: { industry?: string; planTier?: string } }>(
    '/module/:moduleId',
    {
      preHandler: [server.authenticate],
      schema: {
        params: {
          type: 'object',
          properties: {
            moduleId: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            industry: { type: 'string' },
            planTier: { type: 'string' },
          },
        },
      },
      handler: async (request, reply) => {
        try {
          const storeId = (request.user as any).storeId;
          const { moduleId } = request.params;
          const { industry = 'retail', planTier = 'STARTER' } = request.query;
          
          let data: any;
          
          switch (moduleId) {
            case 'metrics':
              data = await dashboardService.getMetrics(storeId, { industry, planTier });
              break;
              
            case 'tasks':
              data = await taskService.getTasks(storeId, { industry, limit: 10 });
              break;
              
            case 'alerts':
              data = await alertService.getAlerts(storeId, { industry, limit: 10 });
              break;
              
            case 'insights':
              data = await insightService.getInsights(storeId, { industry, planTier });
              break;
              
            case 'pos':
            case 'kds':
            case 'appointments':
            case 'inventory':
              // Industry-specific modules
              data = await dashboardService.getIndustryModuleData(
                storeId,
                moduleId,
                { industry, planTier }
              );
              break;
              
            default:
              return reply.code(404).send({
                success: false,
                error: { code: 'MODULE_NOT_FOUND', message: `Module ${moduleId} not found` },
              });
          }
          
          return reply.send({
            success: true,
            data,
            metadata: {
              moduleId,
              industry,
              planTier,
              fetchedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          server.log.error(error);
          return reply.code(500).send({
            success: false,
            error: {
              code: 'MODULE_FETCH_ERROR',
              message: error instanceof Error ? error.message : 'Failed to fetch module data',
            },
          });
        }
      },
    }
  );

  /**
   * POST /api/v1/dashboard/refresh
   * 
   * Force refresh dashboard data (invalidate cache)
   */
  server.post('/refresh', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        // Invalidate cache for this store
        await dashboardService.invalidateCache(storeId);
        
        return reply.send({
          success: true,
          message: 'Dashboard cache invalidated successfully',
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'REFRESH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to refresh dashboard',
          },
        });
      }
    },
  });
};
