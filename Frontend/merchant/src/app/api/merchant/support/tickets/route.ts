import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
        const status = searchParams.get("status")?.toLowerCase() || "all";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
        if (status !== "all") {
            if (status === "open") {where.status = { notIn: ["resolved", "closed"] };
            }
            else if (status === "closed" || status === "resolved") {where.status = { in: ["resolved", "closed"] };
            }
            else {where.status = status;
            }
        }

        const tickets = await prisma.supportTicket?.findMany({
            where,
            orderBy: { lastMessageAt: "desc" },
            take: limit,
            select: {
                id: true,
                storeId: true,
                customerId: true,
                orderId: true,
                conversationId: true,
                type: true,
                category: true,
                status: true,
                priority: true,
                subject: true,
                summary: true,
                lastMessageAt: true,
                createdAt: true,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (tickets ?? []).map((t) => ({
            ...(t as Record<string, unknown>),
            status: (((t as any).status) || "").toString().toLowerCase(),
        }));

        return NextResponse.json(items, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/support/tickets", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
