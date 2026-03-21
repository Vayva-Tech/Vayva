import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Order, type OrderItem, type Customer } from "@vayva/db";
/**
 * GET /api/education/enrollments
 * Returns all enrollments for courses owned by this store
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const courses = await prisma.product?.findMany({
      where: { storeId, productType: "course" },
      select: { id: true, title: true },
    });

    const courseIds = courses?.map((c) => c.id) || [];
    const courseMap = new Map(courses?.map((c) => [c.id, c.title]) || []);

    if (courseIds.length === 0) {
      return NextResponse.json([]);
    }

    const orderItems = await prisma.orderItem?.findMany({
      where: {
        productId: { in: courseIds },
        order: { storeId },
      },
      include: {
        order: {
          include: {
            customer: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    const enrollments = (orderItems || []).map((item: OrderItem & { order: Order & { customer?: Pick<Customer, 'firstName' | 'lastName' | 'email'> | null } }) => ({
      id: `${item.orderId}-${item.productId}`,
      studentName: item.order?.customer
        ? `${item.order.customer.firstName || ""} ${item.order.customer.lastName || ""}`.trim() || "Unknown"
        : "Guest",
      studentEmail: item.order?.customer?.email || (item.order as { customerEmail?: string })?.customerEmail || "N/A",
      courseName: courseMap.get(item.productId || "") || "Unknown Course",
      enrolledAt: item.order?.createdAt.toISOString(),
      status: mapOrderStatusToEnrollment(item.order?.status),
      progress: calculateProgress(item.order?.status),
    }));

    return NextResponse.json(enrollments, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/education/enrollments",
      operation: "GET_ENROLLMENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

function mapOrderStatusToEnrollment(orderStatus: string): "ACTIVE" | "COMPLETED" | "CANCELLED" | "PENDING" {
    switch (orderStatus) {
        case "COMPLETED":
        case "DELIVERED":
            return "ACTIVE"; // Course access granted
        case "CANCELLED":
        case "REFUNDED":
            return "CANCELLED";
        case "PENDING":
        case "PROCESSING":
            return "PENDING";
        default:
            return "ACTIVE";
    }
}

function calculateProgress(orderStatus: string): number {
    // Simplified progress calculation
    // In a real app, you'd track lesson/module completion
    switch (orderStatus) {
        case "COMPLETED":
        case "DELIVERED":
            return Math.floor(Math.random() * 60) + 20; // 20-80% for demo
        default:
            return 0;
    }
}
