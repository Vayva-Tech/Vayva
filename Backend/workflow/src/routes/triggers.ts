/**
 * Trigger Routes
 * Webhook and event trigger endpoints
 */

import { Router } from 'express';
import { TriggerService } from '../services/trigger-service.js';

const router: ReturnType<typeof Router> = Router();
const triggerService = new TriggerService();

// Webhook trigger endpoint
router.post('/webhook/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const signature = req.headers['x-webhook-signature'] as string | undefined;

    const eventData = {
      ...req.body,
      headers: req.headers,
      signature,
      timestamp: new Date().toISOString(),
    };

    const execution = await triggerService.handleWebhook(workflowId, eventData);

    res.json({
      success: true,
      executionId: execution?.id,
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Event trigger endpoint (for internal events)
router.post('/event/:eventType', async (req, res) => {
  try {
    const { eventType } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const eventData = {
      ...req.body,
      eventType,
      timestamp: new Date().toISOString(),
    };

    const executions = await triggerService.handleEvent(merchantId, eventType, eventData);

    res.json({
      success: true,
      triggeredWorkflows: executions.length,
      executionIds: executions.map((e) => e.id),
    });
  } catch (error) {
    console.error('Error handling event:', error);
    res.status(500).json({
      error: 'Failed to process event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get available trigger types
router.get('/types', async (_req, res) => {
  try {
    const types = triggerService.getTriggerTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error getting trigger types:', error);
    res.status(500).json({ error: 'Failed to get trigger types' });
  }
});

export default router;
