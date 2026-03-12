import { prisma, ApprovalExecutionLogStatus } from "@vayva/db";
import { EventBus } from "@/lib/events/eventBus";
// Pendingbing external services for V1
const Services = {
  Refund: {
    issue: async (_payload: unknown) => {
      return { refundId: "ref_test_123" };
    },
  },
  Campaign: {
    send: async (_payload: unknown) => {
      return { jobId: "job_camp_123" };
    },
  },
  Policies: {
    publish: async (_payload: unknown) => {
      return { version: "v2" };
    },
  },
};
export async function executeApproval(
  requestId: string,
  actorId: string,
  correlationId: string,
) {
  const request = await prisma.approval.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new Error("Request not found");
  if (request.status !== "APPROVED") throw new Error("Request not approved");
  // Idempotency Check in Logs
  const existingLog = await prisma.approvalExecutionLog.findFirst({
    where: { approvalRequestId: requestId, status: "SUCCESS" }, // status here is unrelated to ApprovalStatus (log status)
  });
  if (existingLog) {
    return existingLog.output; // Already done
  }
  // Start Execution Log
  await prisma.approvalExecutionLog.create({
    data: {
      approvalRequestId: requestId,
      status: "RUNNING" as ApprovalExecutionLogStatus,
      startedAt: new Date(),
    },
  });
  let output;
  try {
    switch (request.actionType) {
      case "refund.issue":
        output = await Services.Refund.issue(request.payload);
        break;
      case "campaign.send":
        output = await Services.Campaign.send(request.payload);
        break;
      case "policies.publish":
        output = await Services.Policies.publish(request.payload);
        break;
      default:
        throw new Error(`Unknown action type: ${request.actionType}`);
    }
    // Update Log on Success
    await prisma.$transaction([
      // prisma.approval.update not needed/possible with current enum
      prisma.approvalExecutionLog.create({
        // Create new finished log or update running one?
        // For simplicity, we create a success record.
        data: {
          approvalRequestId: requestId,
          status: "SUCCESS" as ApprovalExecutionLogStatus,
          output: output,
          finishedAt: new Date(),
        },
      }),
    ]);
    // Publish Event
    await EventBus.publish({
      merchantId: request.merchantId,
      type: "approvals.executed",
      payload: { requestId, actionType: request.actionType, output },
      ctx: {
        actorId: "system",
        actorType: "system",
        actorLabel: "ApprovalEngine",
        correlationId,
      },
    });
  } catch (error: unknown) {
    // Fail
    // Cannot update status to FAILED as it's not in enum. Log error.
    const msg = error instanceof Error ? error.message : "Unknown error";
    await prisma.approvalExecutionLog.create({
      data: {
        approvalRequestId: requestId,
        status: "FAILED",
        error: msg,
        finishedAt: new Date(),
      },
    });
    await EventBus.publish({
      merchantId: request.merchantId,
      type: "approvals.failed",
      payload: { requestId, error: msg },
      ctx: {
        actorId: "system",
        actorType: "system",
        actorLabel: "ApprovalEngine",
        correlationId,
      },
    });
    throw error;
  }
}
