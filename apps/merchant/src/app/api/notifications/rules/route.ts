import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * GET /api/notifications/rules
 * Get notification rules for the merchant
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const { searchParams } = new URL(request.url);
        const enabledOnly = searchParams.get('enabled') === 'true';
        
        // Import notification engine dynamically
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        let rules = engine.getRules();
        
        // Filter by store if needed
        rules = rules.filter(rule => 
          !rule.conditions?.some(cond => 
            cond.field === 'storeId' && cond.value !== session.merchantId
          )
        );
        
        if (enabledOnly) {
          rules = rules.filter(rule => rule.enabled);
        }
        
        return {
          status: 200,
          body: {
            success: true,
            rules,
            count: rules.length
          }
        };
      } catch (error) {
        console.error('[NOTIFICATION_RULES_GET_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch rules',
            rules: []
          }
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/notifications/rules
 * Create a new notification rule
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const body = await request.json();
        
        // Import notification engine dynamically
        const { initializeNotificationEngine } = await import('@vayva/notification-engine');
        
        const engine = await initializeNotificationEngine();
        
        // Add store context to rule
        const ruleWithStore = {
          ...body,
          conditions: [
            ...(body.conditions || []),
            {
              field: 'storeId',
              operator: 'equals',
              value: session.merchantId
            }
          ]
        };
        
        const newRule = await engine.addRule(ruleWithStore);
        
        return {
          status: 201,
          body: {
            success: true,
            rule: newRule
          }
        };
      } catch (error) {
        console.error('[NOTIFICATION_RULE_CREATE_ERROR]', error);
        return {
          status: 500,
          body: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create rule' 
          }
        };
      }
    },
    { requireAuth: true }
  );
}