/**
 * Workflow Service — persisted in Postgres via Prisma (MerchantWorkflow).
 * API `merchantId` is the store id (storeId in DB).
 */

import type { Workflow, WorkflowStatus, IndustrySlug } from "@vayva/workflow-engine";
import { getAllTemplates, getTemplatesByIndustry } from "@vayva/workflow-templates";
import { prisma, Prisma, type MerchantWorkflow as MerchantWorkflowRow } from "@vayva/db";

export interface ListWorkflowsOptions {
  merchantId: string;
  industry?: string;
  status?: WorkflowStatus;
}

function rowToWorkflow(row: MerchantWorkflowRow): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    industry: row.industry as IndustrySlug,
    merchantId: row.storeId,
    trigger: row.trigger as unknown as Workflow["trigger"],
    nodes: row.nodes as unknown as Workflow["nodes"],
    edges: row.edges as unknown as Workflow["edges"],
    status: row.status as WorkflowStatus,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
  };
}

export class WorkflowService {
  async list(options: ListWorkflowsOptions): Promise<Workflow[]> {
    const { merchantId, industry, status } = options;

    const rows = await prisma.merchantWorkflow.findMany({
      where: {
        storeId: merchantId,
        ...(industry ? { industry } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });

    return rows.map(rowToWorkflow);
  }

  async get(id: string, merchantId: string): Promise<Workflow | null> {
    const row = await prisma.merchantWorkflow.findFirst({
      where: { id, storeId: merchantId },
    });
    if (!row) return null;
    return rowToWorkflow(row);
  }

  async create(
    data: Omit<Workflow, "id" | "createdAt" | "updatedAt">,
  ): Promise<Workflow> {
    const row = await prisma.merchantWorkflow.create({
      data: {
        storeId: data.merchantId,
        name: data.name,
        description: data.description ?? null,
        industry: data.industry,
        trigger: data.trigger as unknown as Prisma.InputJsonValue,
        nodes: data.nodes as unknown as Prisma.InputJsonValue,
        edges: data.edges as unknown as Prisma.InputJsonValue,
        status: data.status,
        version: data.version,
        createdBy: data.createdBy,
      },
    });
    return rowToWorkflow(row);
  }

  async update(
    id: string,
    merchantId: string,
    data: Partial<Workflow>,
  ): Promise<Workflow | null> {
    const existing = await this.get(id, merchantId);
    if (!existing) {
      return null;
    }

    const nextVersion = existing.version + 1;
    const payload: Prisma.MerchantWorkflowUpdateInput = {
      updatedAt: new Date(),
      version: nextVersion,
    };

    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description ?? null;
    if (data.industry !== undefined) payload.industry = data.industry;
    if (data.trigger !== undefined) {
      payload.trigger = data.trigger as unknown as Prisma.InputJsonValue;
    }
    if (data.nodes !== undefined) {
      payload.nodes = data.nodes as unknown as Prisma.InputJsonValue;
    }
    if (data.edges !== undefined) {
      payload.edges = data.edges as unknown as Prisma.InputJsonValue;
    }
    if (data.status !== undefined) payload.status = data.status;

    const row = await prisma.merchantWorkflow.update({
      where: { id },
      data: payload,
    });

    if (row.storeId !== merchantId) {
      return null;
    }

    return rowToWorkflow(row);
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const result = await prisma.merchantWorkflow.deleteMany({
      where: { id, storeId: merchantId },
    });
    return result.count > 0;
  }

  async updateStatus(
    id: string,
    merchantId: string,
    status: WorkflowStatus,
  ): Promise<Workflow | null> {
    return this.update(id, merchantId, { status });
  }

  async getTemplates(industry?: string) {
    if (industry) {
      return getTemplatesByIndustry(industry as IndustrySlug);
    }
    return getAllTemplates();
  }

  /** Test / dev only — wipes all workflows */
  async clear(): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      await prisma.merchantWorkflow.deleteMany({});
    }
  }
}

export default WorkflowService;
