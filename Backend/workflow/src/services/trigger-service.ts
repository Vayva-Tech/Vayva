/**
 * Trigger Service
 * Handles workflow triggers (webhooks, events, schedules)
 */

import type { WorkflowExecution, TriggerType } from '@vayva/workflow-engine';
import { TRIGGER_DEFINITIONS, getDefaultTriggerRegistry } from '@vayva/workflow-engine';
import { WorkflowService } from './workflow-service.js';
import { ExecutionService } from './execution-service.js';

const workflowService = new WorkflowService();
const executionService = new ExecutionService();
const triggerRegistry = getDefaultTriggerRegistry();

export class TriggerService {
  async handleWebhook(
    workflowId: string,
    eventData: Record<string, unknown>
  ): Promise<WorkflowExecution | null> {
    // Get workflow
    const workflows = await workflowService.list({ merchantId: '' }); // Get all workflows
    const workflow = workflows.find((w) => w.id === workflowId);

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.trigger.type !== 'webhook') {
      throw new Error('Workflow is not configured for webhook trigger');
    }

    // Execute workflow
    return executionService.execute({
      workflowId: workflow.id,
      merchantId: workflow.merchantId,
      triggerData: eventData,
    });
  }

  async handleEvent(
    merchantId: string,
    eventType: string,
    eventData: Record<string, unknown>
  ): Promise<WorkflowExecution[]> {
    // Get active workflows for merchant
    const workflows = await workflowService.list({
      merchantId,
      status: 'active',
    });

    const executions: WorkflowExecution[] = [];

    // Find workflows that match this event type
    for (const workflow of workflows) {
      if (workflow.trigger.type === eventType) {
        // Check if trigger conditions are met
        const shouldTrigger = await triggerRegistry.evaluate(
          workflow.trigger,
          eventData
        );

        if (shouldTrigger) {
          const execution = await executionService.execute({
            workflowId: workflow.id,
            merchantId,
            triggerData: eventData,
          });
          executions.push(execution);
        }
      }
    }

    return executions;
  }

  getTriggerTypes(): Array<{
    type: TriggerType;
    label: string;
    description: string;
  }> {
    return Object.values(TRIGGER_DEFINITIONS).map((def: { type: TriggerType; label: string; description: string }) => ({
      type: def.type,
      label: def.label,
      description: def.description,
    }));
  }
}

export default TriggerService;
