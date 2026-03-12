/**
 * Execution Routes
 * Workflow execution endpoints
 */

import { Router } from 'express';
import { z } from 'zod';
import { ExecutionService } from '../services/execution-service.js';

const router: ReturnType<typeof Router> = Router();
const executionService = new ExecutionService();

// Execute workflow manually
router.post('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const merchantId = req.query.merchantId as string;
    const testMode = req.query.test === 'true';

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const triggerData = req.body || {};

    const execution = await executionService.execute({
      workflowId,
      merchantId,
      triggerData,
      testMode,
    });

    res.json({ execution });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      error: 'Failed to execute workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test workflow execution
router.post('/:workflowId/test', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const triggerData = req.body || {};

    const execution = await executionService.execute({
      workflowId,
      merchantId,
      triggerData,
      testMode: true,
    });

    res.json({ execution });
  } catch (error) {
    console.error('Error testing workflow:', error);
    res.status(500).json({
      error: 'Failed to test workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get execution history
router.get('/:workflowId/history', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const merchantId = req.query.merchantId as string;
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const history = await executionService.getHistory(workflowId, merchantId, { limit, offset });
    res.json({ history });
  } catch (error) {
    console.error('Error getting execution history:', error);
    res.status(500).json({ error: 'Failed to get execution history' });
  }
});

// Get execution by ID
router.get('/detail/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const execution = await executionService.get(executionId, merchantId);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json({ execution });
  } catch (error) {
    console.error('Error getting execution:', error);
    res.status(500).json({ error: 'Failed to get execution' });
  }
});

// Cancel running execution
router.post('/detail/:executionId/cancel', async (req, res) => {
  try {
    const { executionId } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    await executionService.cancel(executionId, merchantId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling execution:', error);
    res.status(500).json({ error: 'Failed to cancel execution' });
  }
});

export default router;
