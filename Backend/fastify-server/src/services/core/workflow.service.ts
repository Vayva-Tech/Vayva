import { logger } from '../../lib/logger';

export class WorkflowService {
  constructor() {}

  async getWorkflows(storeId: string, filters: any) {
    const workflowServiceUrl = process.env.WORKFLOW_SERVICE_URL || 'http://127.0.0.1:3004';
    
    try {
      const url = new URL(`${workflowServiceUrl}/api/workflows`);
      url.searchParams.set('merchantId', storeId);
      
      if (filters.industry) {
        url.searchParams.set('industry', filters.industry);
      }
      if (filters.status) {
        url.searchParams.set('status', filters.status);
      }

      const response = await fetch(url.toString(), { method: 'GET' });
      
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body === 'object' && body !== null && 'error' in body 
          ? (body as { error: unknown }).error as string 
          : 'Workflow service error');
      }

      return await response.json();
    } catch (error) {
      logger.error('[Workflow] Failed to fetch workflows', { 
        error: error instanceof Error ? error.message : String(error), 
        storeId 
      });
      throw new Error('Failed to reach workflow service');
    }
  }

  async createWorkflow(storeId: string, userId: string, workflowData: any) {
    const workflowServiceUrl = process.env.WORKFLOW_SERVICE_URL || 'http://127.0.0.1:3004';
    
    try {
      const url = new URL(`${workflowServiceUrl}/api/workflows`);
      url.searchParams.set('merchantId', storeId);
      url.searchParams.set('userId', userId);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      });

      const body = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(typeof body === 'object' && body !== null && 'error' in body 
          ? (body as { error: unknown }).error as string 
          : 'Workflow service error');
      }

      return body;
    } catch (error) {
      logger.error('[Workflow] Failed to create workflow', { 
        error: error instanceof Error ? error.message : String(error), 
        storeId 
      });
      throw new Error('Failed to reach workflow service');
    }
  }
}
