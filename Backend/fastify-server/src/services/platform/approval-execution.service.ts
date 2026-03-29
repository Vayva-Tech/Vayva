import { prisma } from '@vayva/db';
import { EventBus } from '../../lib/events/eventBus';
import { logger } from '../../lib/logger';

export class ApprovalExecutionService {
  constructor(private readonly db = prisma) {}

  async executeApproval(
    requestId: string,
    actorId: string,
    correlationId?: string
  ) {
    const request = await this.db.approval.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'APPROVED') {
      throw new Error('Request not approved');
    }

    // Idempotency check
    const existingLog = await this.db.approvalExecutionLog.findFirst({
      where: { approvalRequestId: requestId, status: 'SUCCESS' },
    });

    if (existingLog) {
      return existingLog.output;
    }

    // Create execution log
    await this.db.approvalExecutionLog.create({
      data: {
        approvalRequestId: requestId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    let output;
    try {
      switch (request.actionType) {
        case 'refund.issue':
          output = await this.executeRefund(request.payload);
          break;
        case 'campaign.send':
          output = await this.executeCampaign(request.payload);
          break;
        case 'policies.publish':
          output = await this.executePolicy(request.payload);
          break;
        default:
          throw new Error(`Unknown action type: ${request.actionType}`);
      }

      // Update log on success
      await this.db.approvalExecutionLog.create({
        data: {
          approvalRequestId: requestId,
          status: 'SUCCESS',
          output: output,
          finishedAt: new Date(),
        },
      });

      // Publish event
      await EventBus.publish({
        merchantId: request.merchantId,
        type: 'approvals.executed',
        payload: { requestId, actionType: request.actionType, output },
        ctx: {
          actorId: 'system',
          actorType: 'system',
          actorLabel: 'ApprovalEngine',
          correlationId,
        },
      });

      return output;
    } catch (error) {
      // Log failure
      await this.db.approvalExecutionLog.create({
        data: {
          approvalRequestId: requestId,
          status: 'FAILED',
          error: (error as Error).message,
          finishedAt: new Date(),
        },
      });

      await EventBus.publish({
        merchantId: request.merchantId,
        type: 'approvals.failed',
        payload: { requestId, error: (error as Error).message },
        ctx: {
          actorId: 'system',
          actorType: 'system',
          actorLabel: 'ApprovalEngine',
          correlationId,
        },
      });

      throw error;
    }
  }

  private async executeRefund(payload: unknown) {
    // TODO: Integrate with actual refund provider
    logger.info('[Approval] Executing refund', { payload });
    return { refundId: `ref_${Date.now()}` };
  }

  private async executeCampaign(payload: unknown) {
    // TODO: Integrate with actual campaign provider
    logger.info('[Approval] Executing campaign', { payload });
    return { jobId: `job_${Date.now()}` };
  }

  private async executePolicy(payload: unknown) {
    // TODO: Integrate with actual policy provider
    logger.info('[Approval] Publishing policy', { payload });
    return { version: `v${Date.now()}` };
  }

  async getApprovalStatus(requestId: string) {
    return await this.db.approval.findUnique({
      where: { id: requestId },
      include: {
        executionLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getPendingApprovals(storeId: string) {
    return await this.db.approval.findMany({
      where: {
        merchantId: storeId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
