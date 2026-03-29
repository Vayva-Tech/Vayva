import { api } from '@/lib/api-client';

// Pendingbing external services for V1
const Services = {
    Refund: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        issue: async (payload: unknown) => {
            return { refundId: "ref_test_123" };
        },
    },
    Campaign: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        send: async (payload: unknown) => {
            return { jobId: "job_camp_123" };
        },
    },
    Policies: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publish: async (payload: unknown) => {
            return { version: "v2" };
        },
    },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeApproval(requestId: any, actorId: any, correlationId: string | undefined) {
    try {
        // Fetch approval request from backend
        const approvalRes = await api.get(`/approvals/${requestId}`);
        if (!approvalRes.success || !approvalRes.data) {
            throw new Error("Request not found");
        }
        
        const request = approvalRes.data;
        
        if (request.status !== "APPROVED") {
            throw new Error("Request not approved");
        }
        
        // Check idempotency via backend API
        const logsRes = await api.get(`/approvals/logs/${requestId}?status=SUCCESS`);
        if (logsRes.success && logsRes.data && logsRes.data.length > 0) {
            return logsRes.data[0].output; // Already done
        }
        
        // Create execution log via backend API
        await api.post('/approvals/execute/log', {
            approvalRequestId: requestId,
            status: "SUCCESS",
            startedAt: new Date(),
        });
        
        let output;
        switch (request.actionType) {
            case "refund.issue":
                output = await Services.Refund?.issue(request.payload);
                break;
            case "campaign.send":
                output = await Services.Campaign?.send(request.payload);
                break;
            case "policies.publish":
                output = await Services.Policies?.publish(request.payload);
                break;
            default:
                throw new Error(`Unknown action type: ${request.actionType}`);
        }
        // Update Log on Success
        await prisma.$transaction([
            // prisma.approval?.update not needed/possible with current enum
            prisma.approvalExecutionLog?.create({
                // Create new finished log or update running one?
                // For simplicity, we create a success record.
                data: {
                    approvalRequestId: requestId,
                    status: "SUCCESS",
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
    }
    catch (error) {
        // Fail
        // Cannot update status to FAILED as it's not in enum. Log error.
        await prisma.approvalExecutionLog?.create({
            data: {
                approvalRequestId: requestId,
                status: "FAILED",
                error: (error as Error).message,
                finishedAt: new Date(),
            },
        });
        await EventBus.publish({
            merchantId: request.merchantId,
            type: "approvals.failed",
            payload: { requestId, error: (error as Error).message },
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
