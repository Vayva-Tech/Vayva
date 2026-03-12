import { prisma, ReturnStatus } from "@vayva/db";

function _isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ReturnService {
  static async createRequest(
    storeId: string,
    orderId: string,
    customerPhone: string,
    payload: Record<string, unknown>,
  ) {
    // Fetch order to get required fields
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { storeId: true, customerEmail: true, customerPhone: true },
    });
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if exists
    const existing = await prisma.returnRequest.findFirst({
      where: { orderId: orderId, status: { not: ReturnStatus.CANCELLED } },
    });
    if (existing) {
      throw new Error("Return already active for this order");
    }

    // Map reason string to enum value
    const reasonStr = typeof payload.reason === "string" ? payload.reason.toLowerCase() : "";
    let reasonCode: "DEFECTIVE" | "WRONG_ITEM" | "NOT_AS_DESCRIBED" | "CHANGED_MIND" | "ARRIVED_LATE" | "OTHER" = "OTHER";
    if (reasonStr.includes("defect") || reasonStr.includes("damage") || reasonStr.includes("broken")) {
      reasonCode = "DEFECTIVE";
    } else if (reasonStr.includes("wrong") || reasonStr.includes("incorrect")) {
      reasonCode = "WRONG_ITEM";
    } else if (reasonStr.includes("not as") || reasonStr.includes("description")) {
      reasonCode = "NOT_AS_DESCRIBED";
    } else if (reasonStr.includes("late") || reasonStr.includes("arrived")) {
      reasonCode = "ARRIVED_LATE";
    } else if (reasonStr.includes("change") || reasonStr.includes("mind")) {
      reasonCode = "CHANGED_MIND";
    }

    const request = await prisma.returnRequest.create({
      data: {
        storeId: order.storeId,
        merchantId: storeId,
        orderId: orderId,
        customerId: customerPhone || order.customerPhone || order.customerEmail || "",
        reasonCode: reasonCode,
        reasonText: typeof payload.reason === "string" ? payload.reason : undefined,
        resolutionType: "REFUND",
        status: ReturnStatus.REQUESTED,
      },
    });
    return request;
  }
  static async getRequests(storeId: string) {
    return prisma.returnRequest.findMany({
      where: { merchantId: storeId },
      orderBy: { createdAt: "desc" },
      // include: { items: true, logistics: true } // Removed
    });
  }
  static async updateStatus(
    requestId: string,
    status: ReturnStatus,
    _actorId: string,
    _data: Record<string, unknown>,
  ) {
    // Logic for specific status transitions
    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: requestId },
        data: {
          status: status,
          approvedAt: status === ReturnStatus.APPROVED ? new Date() : undefined,
        },
      });
    });
  }
}
