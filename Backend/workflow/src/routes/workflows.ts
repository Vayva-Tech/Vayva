/**
 * Workflow Routes
 * CRUD operations for workflows
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { type Workflow, type WorkflowStatus, type TriggerType, type IndustrySlug, type NodeType, type WorkflowNode, getDefaultValidator } from '@vayva/workflow-engine';
import { WorkflowService } from '../services/workflow-service.js';

const router: ReturnType<typeof Router> = Router();
const workflowService = new WorkflowService();
const validator = getDefaultValidator();

// Validation schemas - using z.any() for complex union types to avoid Zod/TypeScript mismatches
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  industry: z.any(), // IndustrySlug - validated at runtime
  trigger: z.object({
    type: z.any(), // TriggerType - validated at runtime
    config: z.record(z.unknown()),
  }),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.any(), // NodeType - validated at runtime
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.record(z.unknown()),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    condition: z.object({
      type: z.enum(['true', 'false', 'custom']),
      expression: z.string().optional(),
    }).optional(),
    label: z.string().optional(),
  })),
});

const updateWorkflowSchema = createWorkflowSchema.partial();

// List workflows
router.get('/', async (req, res) => {
  try {
    const merchantId = req.query.merchantId as string;
    const industry = req.query.industry as string | undefined;
    const status = req.query.status as WorkflowStatus | undefined;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const workflows = await workflowService.list({
      merchantId,
      industry,
      status,
    });

    res.json({ workflows });
  } catch (error) {
    console.error('Error listing workflows:', error);
    res.status(500).json({ error: 'Failed to list workflows' });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const workflow = await workflowService.get(id, merchantId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Error getting workflow:', error);
    res.status(500).json({ error: 'Failed to get workflow' });
  }
});

// Create workflow
router.post('/', async (req, res) => {
  try {
    const merchantId = req.query.merchantId as string;
    const createdBy = req.query.userId as string || 'system';

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const result = createWorkflowSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.format(),
      });
    }

    const workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> = {
      ...result.data,
      merchantId,
      status: 'draft',
      version: 1,
      createdBy,
      industry: result.data.industry as IndustrySlug,
      trigger: {
        type: result.data.trigger.type as TriggerType,
        config: result.data.trigger.config,
      },
      nodes: result.data.nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as unknown as WorkflowNode['data'],
      })) as unknown as WorkflowNode[],
    };

    // Validate workflow structure
    const tempWorkflow = { ...workflowData, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as Workflow;
    const validation = validator.validate(tempWorkflow);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Workflow validation failed',
        details: validation.errors,
      });
    }

    const workflow = await workflowService.create(workflowData);
    res.status(201).json({ workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const result = updateWorkflowSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.format(),
      });
    }

    // Check if workflow exists
    const existing = await workflowService.get(id, merchantId);
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Validate updated workflow
    if (result.data.nodes || result.data.edges) {
      const updatedWorkflow = { ...existing, ...result.data } as Workflow;
      const validation = validator.validate(updatedWorkflow);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Workflow validation failed',
          details: validation.errors,
        });
      }
    }

    // Cast types for update
    const updateData: Partial<Workflow> = {
      ...result.data,
      industry: result.data.industry as IndustrySlug | undefined,
      trigger: result.data.trigger ? {
        type: result.data.trigger.type as TriggerType,
        config: result.data.trigger.config,
      } : undefined,
      nodes: result.data.nodes?.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as unknown as WorkflowNode['data'],
      })) as unknown as WorkflowNode[],
    };

    const workflow = await workflowService.update(id, merchantId, updateData);
    res.json({ workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const existing = await workflowService.get(id, merchantId);
    if (!existing) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await workflowService.delete(id, merchantId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// Activate workflow
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const workflow = await workflowService.updateStatus(id, merchantId, 'active');
    res.json({ workflow });
  } catch (error) {
    console.error('Error activating workflow:', error);
    res.status(500).json({ error: 'Failed to activate workflow' });
  }
});

// Pause workflow
router.post('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.query.merchantId as string;

    if (!merchantId) {
      return res.status(400).json({ error: 'merchantId is required' });
    }

    const workflow = await workflowService.updateStatus(id, merchantId, 'paused');
    res.json({ workflow });
  } catch (error) {
    console.error('Error pausing workflow:', error);
    res.status(500).json({ error: 'Failed to pause workflow' });
  }
});

// Get workflow templates
router.get('/templates/list', async (req, res) => {
  try {
    const industry = req.query.industry as string | undefined;
    const templates = await workflowService.getTemplates(industry);
    res.json({ templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

export default router;
