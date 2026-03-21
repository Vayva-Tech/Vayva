import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

interface RouteParams {
  params: Promise<{ ruleId: string }>;
}

/**
 * PUT /api/notifications/rules/[ruleId]
 * Update a notification rule
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { ruleId } = await params;
  
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const body = await request.json();
        
        // Import notification engine dynamically
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        
        // Verify rule belongs to this store
        const existingRule = engine.getRule(ruleId);
        if (!existingRule) {
          return {
            status: 404,
            body: { success: false, error: 'Rule not found' }
          };
        }
        
        // Check if rule belongs to this merchant
        const storeCondition = existingRule.conditions?.find(
          cond => cond.field === 'storeId' && cond.value === session.merchantId
        );
        
        if (!storeCondition) {
          return {
            status: 403,
            body: { success: false, error: 'Access denied' }
          };
        }
        
        await engine.updateRule(ruleId, body);
        
        return {
          status: 200,
          body: {
            success: true,
            message: 'Rule updated successfully'
          }
        };
      } catch (error) {
        console.error('[NOTIFICATION_RULE_UPDATE_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update rule' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * DELETE /api/notifications/rules/[ruleId]
 * Delete a notification rule
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { ruleId } = await params;
  
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        // Import notification engine dynamically
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        
        // Verify rule belongs to this store
        const existingRule = engine.getRule(ruleId);
        if (!existingRule) {
          return {
            status: 404,
            body: { success: false, error: 'Rule not found' }
          };
        }
        
        // Check if rule belongs to this merchant
        const storeCondition = existingRule.conditions?.find(
          cond => cond.field === 'storeId' && cond.value === session.merchantId
        );
        
        if (!storeCondition) {
          return {
            status: 403,
            body: { success: false, error: 'Access denied' }
          };
        }
        
        await engine.deleteRule(ruleId);
        
        return {
          status: 200,
          body: {
            success: true,
            message: 'Rule deleted successfully'
          }
        };
      } catch (error) {
        console.error('[NOTIFICATION_RULE_DELETE_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete rule' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}